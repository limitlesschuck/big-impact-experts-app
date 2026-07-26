import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuideContent } from "@/lib/claude";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { panelistId } = await req.json();
  if (!panelistId) {
    return NextResponse.json({ error: "panelistId is required" }, { status: 400 });
  }

  const panelist = await prisma.panelist.findFirst({
    where: { id: panelistId, eventId: params.id },
  });

  if (!panelist) {
    return NextResponse.json({ error: "Panelist not found on this event" }, { status: 404 });
  }

  if (!panelist.transcriptSegment && !panelist.bio) {
    return NextResponse.json(
      { error: "Panelist needs a transcript segment or bio before generating a guide" },
      { status: 400 }
    );
  }

  let generated;
  try {
    generated = await generateGuideContent({
      panelistName: panelist.name,
      panelistBio: panelist.bio,
      transcriptSegment: panelist.transcriptSegment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Guide generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await prisma.panelist.update({
    where: { id: panelist.id },
    data: {
      guideBio: generated.bio,
      guideFrameworks: generated.frameworks,
      guideTakeaways: generated.takeaways,
      guideQuotes: generated.quotes,
      guideActionItems: generated.actionItems,
      guidePdfUrl: null,
    },
  });

  await prisma.aiContentLog.create({
    data: {
      panelistId: panelist.id,
      provider: "anthropic",
      contentType: "guide",
      prompt: `Guide generation for panelist ${panelist.name}`,
      output: JSON.stringify(generated),
    },
  });

  return NextResponse.json({ generated });
}
