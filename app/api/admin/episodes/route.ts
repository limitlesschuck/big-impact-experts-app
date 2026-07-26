import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = filter ? { publishStatus: filter } : {};

  const [episodes, total] = await Promise.all([
    prisma.episode.findMany({
      where,
      orderBy: { captivatePublishedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        episodeNumber: true,
        titleOriginal: true,
        titleYoutube: true,
        guestName: true,
        crisisCategory: true,
        publishStatus: true,
        captivatePublishedAt: true,
        youtubeId: true,
      },
    }),
    prisma.episode.count({ where }),
  ]);

  return NextResponse.json({ episodes, total, page, limit });
}
