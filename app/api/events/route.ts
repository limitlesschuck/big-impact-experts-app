import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = { publishStatus: "published" };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { eventDate: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        titleOriginal: true,
        titleYoutube: true,
        descriptionWebsite: true,
        thumbnailUrl: true,
        coverArtUrl: true,
        youtubeThumbnailUrl: true,
        youtubeId: true,
        durationSeconds: true,
        eventDate: true,
        publishedAt: true,
        panelists: {
          select: { id: true, name: true, headshotUrl: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, limit });
}
