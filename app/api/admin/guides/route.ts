import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const episodes = await prisma.episode.findMany({
    where: { guidePdfUrl: { not: null } },
    select: { id: true, titleOriginal: true, titleYoutube: true },
    orderBy: { titleOriginal: "asc" },
  });

  return NextResponse.json({
    guides: episodes.map((e) => ({
      id: e.id,
      title: e.titleYoutube ?? e.titleOriginal,
    })),
  });
}
