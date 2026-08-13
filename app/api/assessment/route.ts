import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hasSystemeApiKey,
  getOrCreateSystemeContact,
  addTagsToSystemeContact,
} from "@/lib/systeme";

interface AssessmentBody {
  firstName: string;
  email: string;
  crisisCategory: string;
  crisisDuration: string;
  urgency: string;
  sourceEventId?: string;
}

async function getAssessmentConfig() {
  const record = await prisma.assessmentConfig.findFirst();
  const config = record?.config as Record<string, unknown> | null;
  const thresholds = config?.thresholds as { coachReferral?: number; resource?: number } | null;
  const questions = (config?.questions as Array<{ type: string; options?: Array<{ value: string; score?: number }> }>) ?? [];
  const urgencyQuestion = questions.find((q) => q.type === "urgency");

  const scoreMap: Record<string, number> = { crisis: 10, struggling: 7, healing: 4, exploring: 2 };
  for (const opt of urgencyQuestion?.options ?? []) {
    if (opt.score !== undefined) scoreMap[opt.value] = opt.score;
  }

  return {
    scoreMap,
    coachReferralThreshold: thresholds?.coachReferral ?? 8,
    resourceThreshold: thresholds?.resource ?? 5,
  };
}

function computeScore(urgency: string, scoreMap: Record<string, number>): number {
  return scoreMap[urgency] ?? 5;
}

function computeResultType(score: number, coachReferralThreshold: number, resourceThreshold: number): string {
  if (score >= coachReferralThreshold) return "coach_referral";
  if (score >= resourceThreshold) return "resource";
  return "nurture";
}

const SYSTEME_TAG_IDS: Record<string, number> = {
  "lls-assessment": 1975330,
  "lls-grief": 1975331,
  "lls-relationship": 1975332,
  "lls-health": 1975333,
  "lls-financial": 1975334,
  "lls-spiritual": 1975335,
  "lls-career": 1975336,
  "lls-coach-referral": 1975337,
};

async function syncToSysteme(params: {
  email: string;
  firstName: string;
  crisisCategory: string;
  urgency: string;
  resultType: string;
}): Promise<boolean> {
  if (!hasSystemeApiKey()) return false;

  try {
    const contact = await getOrCreateSystemeContact(
      params.email,
      params.firstName
    );
    if (!contact) return false;

    const tagIds: number[] = [SYSTEME_TAG_IDS["lls-assessment"]];
    const categoryTagId = SYSTEME_TAG_IDS[`lls-${params.crisisCategory}`];
    if (categoryTagId) tagIds.push(categoryTagId);
    if (params.resultType === "coach_referral") {
      tagIds.push(SYSTEME_TAG_IDS["lls-coach-referral"]);
    }

    return await addTagsToSystemeContact(contact.id, tagIds);
  } catch (err) {
    console.error("Systeme.io sync error:", err);
    return false;
  }
}

async function getAffiliateRoute(
  crisisCategory: string,
  urgency: string
): Promise<string | null> {
  const route = await prisma.affiliateRoute.findFirst({
    where: {
      crisisCategory,
      isActive: true,
      OR: [{ urgencyLevel: urgency }, { urgencyLevel: "any" }],
    },
    orderBy: { priority: "asc" },
  });
  if (route) return route.id;

  const defaultRoute = await prisma.affiliateRoute.findFirst({
    where: { isDefault: true, isActive: true },
    orderBy: { priority: "asc" },
  });
  return defaultRoute?.id ?? null;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AssessmentBody;

  const { firstName, email, crisisCategory, crisisDuration, urgency, sourceEventId } = body;

  if (!email || !crisisCategory || !urgency) {
    return NextResponse.json(
      { error: "email, crisisCategory, and urgency are required" },
      { status: 400 }
    );
  }

  const assessmentCfg = await getAssessmentConfig();
  const score = computeScore(urgency, assessmentCfg.scoreMap);
  const resultType = computeResultType(score, assessmentCfg.coachReferralThreshold, assessmentCfg.resourceThreshold);
  const affiliateRouteId = await getAffiliateRoute(crisisCategory, urgency);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const lead = await prisma.lead.create({
    data: {
      email,
      firstName: firstName || null,
      crisisCategory,
      crisisDuration: crisisDuration || null,
      urgency,
      score,
      resultType,
      sourceEventId: sourceEventId || null,
      affiliateRouteId,
      ipAddress: ip,
      emailSynced: false,
    },
  });

  const synced = await syncToSysteme({
    email,
    firstName,
    crisisCategory,
    urgency,
    resultType,
  });

  if (synced) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { emailSynced: true },
    });
  }

  return NextResponse.json({
    success: true,
    leadId: lead.id,
    resultType,
    crisisCategory,
    urgency,
    score,
  });
}
