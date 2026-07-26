import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    publishStatus: "published",
    ...(category ? { crisisCategory: category } : {}),
  };

  const [episodes, total] = await Promise.all([
    prisma.episode.findMany({
      where,
      orderBy: { captivatePublishedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        titleOriginal: true,
        titleYoutube: true,
        descriptionWebsite: true,
        guestName: true,
        crisisCategory: true,
        thumbnailUrl: true,
        coverArtUrl: true,
        youtubeThumbnailUrl: true,
        youtubeId: true,
        episodeNumber: true,
        durationSeconds: true,
        captivatePublishedAt: true,
        publishedAt: true,
      },
    }),
    prisma.episode.count({ where }),
  ]);

  return NextResponse.json({ episodes, total, page, limit });
}
