import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchCaptivateEpisodes } from "@/lib/captivate";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const episodes = await fetchCaptivateEpisodes();
  let updated = 0;

  for (const ep of episodes) {
    if (!ep.episodeNumber) continue;
    await prisma.episode.updateMany({
      where: { captivateId: ep.id },
      data: { episodeNumber: ep.episodeNumber },
    });
    updated++;
  }

  return NextResponse.json({
    updated,
    message: `Episode numbers synced for ${updated} episodes. No other data was changed.`,
  });
}
