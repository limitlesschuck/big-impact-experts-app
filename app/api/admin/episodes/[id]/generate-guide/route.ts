import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuideContent } from "@/lib/claude";

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

  if (!episode.transcript && !episode.descriptionOriginal) {
    return NextResponse.json(
      { error: "Episode needs a transcript or show notes before generating a guide" },
      { status: 400 }
    );
  }

  let generated;
  try {
    generated = await generateGuideContent({
      guestName: episode.guestName,
      transcript: episode.transcript,
      descriptionOriginal: episode.descriptionOriginal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Guide generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await prisma.episode.update({
    where: { id: episode.id },
    data: {
      guideBio: generated.guestBio,
      guideFrameworks: generated.frameworks,
      guideTakeaways: generated.takeaways,
      guideQuotes: generated.quotes,
      guideActionItems: generated.actionItems,
      guidePdfUrl: null,
    },
  });

  return NextResponse.json({ generated });
}
