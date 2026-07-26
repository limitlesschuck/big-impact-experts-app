import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateEpisodeContent } from "@/lib/claude";
import { generateSlug } from "@/lib/slug";

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

  const prompt = `Title: ${episode.riversideTitle ?? episode.titleOriginal}\nGuest: ${episode.guestName ?? "Not specified"}\nTranscript length: ${episode.transcript?.length ?? 0} chars`;

  let generated;
  try {
    generated = await generateEpisodeContent({
      titleOriginal: episode.titleOriginal,
      descriptionOriginal: episode.descriptionOriginal ?? "",
      transcript: episode.transcript,
      riversideTitle: episode.riversideTitle,
      riversideKeywords: episode.riversideKeywords,
      guestName: episode.guestName,
      crisisCategory: episode.crisisCategory,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await prisma.aiContentLog.create({
    data: {
      episodeId: episode.id,
      provider: "claude",
      contentType: "full_episode",
      prompt,
      output: JSON.stringify(generated),
      tokensUsed: null,
      approved: false,
    },
  });

  const newSlug = generateSlug({
    episodeNumber: episode.episodeNumber,
    titleYoutube: generated.youtubeTitles[0],
    titleOriginal: episode.titleOriginal,
    guestName: episode.guestName,
  });

  await prisma.episode.update({
    where: { id: episode.id },
    data: {
      slug: newSlug,
      titleYoutube: generated.youtubeTitles[0],
      titlePodcast: generated.podcastTitle,
      descriptionYoutube: generated.youtubeDescription,
      descriptionWebsite: generated.websiteDescription,
      tags: generated.tags,
      crisisCategory: episode.crisisCategory ?? generated.suggestedCategory,
      publishStatus: "ai_generated",
    },
  });

  return NextResponse.json({ generated });
}
