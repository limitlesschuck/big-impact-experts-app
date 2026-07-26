import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [episodes, leads, coaches, pendingEpisodes] = await Promise.all([
    prisma.episode.count(),
    prisma.lead.count(),
    prisma.coach.count(),
    prisma.episode.count({ where: { publishStatus: "approved" } }),
  ]);

  return NextResponse.json({ episodes, leads, coaches, pendingEpisodes });
}
