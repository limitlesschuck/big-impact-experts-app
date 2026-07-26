import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchCaptivateEpisodes } from "@/lib/captivate";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
  });

  if (!episode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!episode.captivateId) {
    return NextResponse.json(
      { error: "This episode has no Captivate ID — cannot sync" },
      { status: 400 }
    );
  }

  const episodes = await fetchCaptivateEpisodes();
  const match = episodes.find((ep) => ep.id === episode.captivateId);

  if (!match) {
    return NextResponse.json(
      { error: "Episode not found in Captivate RSS feed" },
      { status: 404 }
    );
  }

  await prisma.episode.update({
    where: { id: episode.id },
    data: {
      titleOriginal: match.title,
      descriptionOriginal: match.description,
      audioUrl: match.audioUrl,
      thumbnailUrl: episode.coverArtUrl ?? match.thumbnailUrl,
      durationSeconds: match.durationSeconds,
      episodeNumber: match.episodeNumber ?? episode.episodeNumber,
      captivatePublishedAt: match.publishedAt
        ? new Date(match.publishedAt)
        : episode.captivatePublishedAt,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Episode synced from Captivate — AI content was not changed",
  });
}
