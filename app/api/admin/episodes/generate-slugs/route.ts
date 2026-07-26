import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const episodes = await prisma.episode.findMany({
    where: { slug: null },
    select: {
      id: true,
      episodeNumber: true,
      titleYoutube: true,
      titleOriginal: true,
      guestName: true,
    },
  });

  let updated = 0;
  const errors: string[] = [];

  for (const ep of episodes) {
    let slug = generateSlug({
      episodeNumber: ep.episodeNumber,
      titleYoutube: ep.titleYoutube,
      titleOriginal: ep.titleOriginal,
      guestName: ep.guestName,
    });

    const existing = await prisma.episode.findUnique({ where: { slug } });
    if (existing && existing.id !== ep.id) {
      slug = `${slug}-${ep.id.slice(-4)}`;
    }

    try {
      await prisma.episode.update({
        where: { id: ep.id },
        data: { slug },
      });
      updated++;
    } catch {
      errors.push(ep.id);
    }
  }

  return NextResponse.json({
    updated,
    errors,
    message: `Generated slugs for ${updated} episodes`,
  });
}
