import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const MAKE_WEBHOOK_URL =
  "https://hook.us2.make.com/026hpzp326lmlulqd6mx4asxfowkv4rf";

function buildPayload(episode: {
  id: string;
  episodeNumber: number | null;
  captivatePublishedAt: Date | null;
  guestName: string | null;
  guestEmail: string | null;
  affiliateLink: string | null;
  swipeCopy: string | null;
  systemeContactId: string | null;
  titleOriginal: string;
  titleYoutube: string | null;
  titlePodcast: string | null;
  descriptionYoutube: string | null;
  descriptionWebsite: string | null;
  descriptionOriginal: string | null;
  captivateId: string | null;
  thumbnailUrl: string | null;
  coverArtUrl: string | null;
  youtubeThumbnailUrl: string | null;
  audioUrl: string | null;
  mp4Url: string | null;
  tags: string[];
  crisisCategory: string | null;
}) {
  const epNum = episode.episodeNumber;
  const paddedNum = epNum ? String(epNum).padStart(3, "0") : null;
  const folderHint =
    paddedNum && episode.guestName
      ? `LLS-${paddedNum} ${episode.guestName}`
      : null;

  return {
    episodeId: episode.id,
    epNumber: epNum,
    pubDate: episode.captivatePublishedAt
      ? episode.captivatePublishedAt.toISOString().split("T")[0]
      : null,
    guestName: episode.guestName,
    guestEmail: episode.guestEmail,
    affiliateLink: episode.affiliateLink,
    swipeCopy: episode.swipeCopy,
    systemeContactId: episode.systemeContactId,
    title: episode.titleYoutube ?? episode.titleOriginal,
    titlePodcast: episode.titlePodcast,
    desc: episode.descriptionYoutube,
    captivateId: episode.captivateId,
    epUrl: episode.captivateId
      ? `https://limitlesslivingpodcast.com/episode/${episode.captivateId}`
      : null,
    thumb: episode.youtubeThumbnailUrl ?? episode.thumbnailUrl,
    coverArtUrl: episode.coverArtUrl ?? episode.thumbnailUrl,
    showNotes: episode.descriptionWebsite,
    keywords: episode.tags.join(", "),
    mp4Url: episode.mp4Url,
    mp4FolderHint: folderHint,
    audioUrl: episode.audioUrl,
    crisisCategory: episode.crisisCategory,
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

  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
  });

  if (!episode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (publishMode && episode.publishStatus !== "approved") {
    return NextResponse.json(
      { error: "Episode must be in approved status before publishing" },
      { status: 400 }
    );
  }

  const payload = buildPayload(episode);

  let webhookResult: { ok: boolean; status: number; body: string };
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

  await prisma.publishLog.create({
    data: {
      episodeId: episode.id,
      triggeredById: session.user.id,
      platform: publishMode ? "youtube" : "make_sync",
      status: webhookResult.ok ? "success" : "failed",
      webhookPayload: payload as unknown as Prisma.InputJsonValue,
      responseBody: webhookResult as unknown as Prisma.InputJsonValue,
    },
  });

  if (publishMode && webhookResult.ok) {
    await prisma.episode.update({
      where: { id: episode.id },
      data: { publishStatus: "published", publishedAt: new Date() },
    });
  }

  return NextResponse.json({
    success: webhookResult.ok,
    payload,
    webhookResponse: webhookResult,
    message: webhookResult.ok
      ? publishMode
        ? "Episode published — Make.com webhook fired successfully"
        : "Sent to Make.com successfully"
      : `Webhook failed: ${webhookResult.body}`,
  });
}
