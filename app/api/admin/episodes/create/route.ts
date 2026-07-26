import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    captivateId,
    episodeNumber,
    guestName,
    guestEmail,
    riversideTitle,
    riversideKeywords,
    transcript,
    descriptionOriginal,
    publishDate,
    coverArtUrl,
    mp4Url,
  } = body;

  if (!riversideTitle && !guestName) {
    return NextResponse.json(
      { error: "At least a working title or guest name is required" },
      { status: 400 }
    );
  }

  const slug = generateSlug({
    episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
    titleYoutube: null,
    titleOriginal: riversideTitle ?? `Episode with ${guestName ?? "guest"}`,
    guestName: guestName || null,
  });

  const episode = await prisma.episode.create({
    data: {
      slug,
      captivateId: captivateId || null,
      episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
      titleOriginal: riversideTitle ?? `Episode with ${guestName}`,
      riversideTitle: riversideTitle || null,
      riversideKeywords: riversideKeywords || null,
      transcript: transcript || null,
      descriptionOriginal: descriptionOriginal || null,
      guestName: guestName || null,
      guestEmail: guestEmail || null,
      coverArtUrl: coverArtUrl || null,
      thumbnailUrl: coverArtUrl || null,
      mp4Url: mp4Url || null,
      captivatePublishedAt: publishDate ? new Date(publishDate) : null,
      publishStatus: "draft",
    },
  });

  return NextResponse.json({ id: episode.id, success: true });
}
