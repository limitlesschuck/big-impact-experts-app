import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchExpertsToQuestion } from "@/lib/expertMatch";

const MAX_QUESTION_LENGTH = 1000;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Independent of app/dashboard/layout.tsx's own status check -- that
  // one only re-runs on page navigation, not on a fetch from a page
  // that's already open, so a member disabled mid-session could
  // otherwise still hit this endpoint until their next navigation.
  const member = await prisma.member.findUnique({
    where: { id: session.user.id },
    select: { status: true, firstName: true, lastName: true, email: true },
  });
  if (!member || member.status === "disabled") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "Question is too long" }, { status: 400 });
  }

  // Included on every response (not just no-match ones) so the widget
  // can pre-fill the "send to Chuck" fallback without a second round
  // trip -- this route already has the Member row loaded for the
  // status check above.
  const memberContact = {
    name: [member.firstName, member.lastName].filter(Boolean).join(" "),
    email: member.email,
  };

  try {
    const result = await matchExpertsToQuestion(question);
    return NextResponse.json({ ...result, memberContact });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Expert match error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
