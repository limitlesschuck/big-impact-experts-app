import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL ?? "";

function buildPayload(event: {
  id: string;
  eventDate: Date;
  hostName: string | null;
  recordingUrl: string | null;
  giftPublicUntil: Date | null;
  titleOriginal: string;
  titleYoutube: string | null;
  titlePodcast: string | null;
  descriptionYoutube: string | null;
  descriptionWebsite: string | null;
  thumbnailUrl: string | null;
  coverArtUrl: string | null;
  youtubeThumbnailUrl: string | null;
  audioUrl: string | null;
  mp4Url: string | null;
  tags: string[];
  panelists: {
    id: string;
    name: string;
    email: string | null;
    affiliateLink: string | null;
    swipeCopy: string | null;
  }[];
}) {
  return {
    eventId: event.id,
    eventDate: event.eventDate.toISOString().split("T")[0],
    hostName: event.hostName,
    title: event.titleYoutube ?? event.titleOriginal,
    titlePodcast: event.titlePodcast,
    desc: event.descriptionYoutube,
    recordingUrl: event.recordingUrl,
    giftPublicUntil: event.giftPublicUntil
      ? event.giftPublicUntil.toISOString()
      : null,
    thumb: event.youtubeThumbnailUrl ?? event.thumbnailUrl,
    coverArtUrl: event.coverArtUrl ?? event.thumbnailUrl,
    showNotes: event.descriptionWebsite,
    keywords: event.tags.join(", "),
    mp4Url: event.mp4Url,
    audioUrl: event.audioUrl,
    panelists: event.panelists.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      affiliateLink: p.affiliateLink,
      swipeCopy: p.swipeCopy,
    })),
    ytUploaded: "Queued",
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const publishMode = body.publish === true;

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      panelists: {
        select: { id: true, name: true, email: true, affiliateLink: true, swipeCopy: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (publishMode && event.publishStatus !== "approved") {
    return NextResponse.json(
      { error: "Event must be in approved status before publishing" },
      { status: 400 }
    );
  }

  const payload = buildPayload(event);

  let webhookResult: { ok: boolean; status: number; body: string };
  if (!MAKE_WEBHOOK_URL) {
    webhookResult = {
      ok: false,
      status: 0,
      body: "MAKE_WEBHOOK_URL is not configured for this environment",
    };
  } else {
    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseBody = await res.text();
      webhookResult = { ok: res.ok, status: res.status, body: responseBody };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      webhookResult = { ok: false, status: 0, body: message };
    }
  }

  await prisma.publishLog.create({
    data: {
      eventId: event.id,
      triggeredById: session.user.id,
      platform: publishMode ? "youtube" : "make_sync",
      status: webhookResult.ok ? "success" : "failed",
      webhookPayload: payload as unknown as Prisma.InputJsonValue,
      responseBody: webhookResult as unknown as Prisma.InputJsonValue,
    },
  });

  if (publishMode && webhookResult.ok) {
    await prisma.event.update({
      where: { id: event.id },
      data: { publishStatus: "published", publishedAt: new Date() },
    });
  }

  return NextResponse.json({
    success: webhookResult.ok,
    payload,
    webhookResponse: webhookResult,
    message: webhookResult.ok
      ? publishMode
        ? "Event published — Make.com webhook fired successfully"
        : "Sent to Make.com successfully"
      : `Webhook failed: ${webhookResult.body}`,
  });
}
