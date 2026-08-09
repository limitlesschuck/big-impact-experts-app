import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuideContent } from "@/lib/claude";

const MAX_PAST_APPEARANCES = 5;

function formatEventLabel(event: { titleOriginal: string; eventDate: Date }): string {
  return `${event.titleOriginal} (${event.eventDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })})`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { panelistId, includePastAppearances } = await req.json();
  if (!panelistId) {
    return NextResponse.json({ error: "panelistId is required" }, { status: 400 });
  }

  const panelist = await prisma.panelist.findFirst({
    where: { id: panelistId, eventId: params.id },
    include: { event: { select: { titleOriginal: true, eventDate: true } } },
  });

  if (!panelist) {
    return NextResponse.json({ error: "Panelist not found on this event" }, { status: 404 });
  }

  const email = panelist.email?.trim();
  const pastMatches =
    includePastAppearances && email
      ? await prisma.panelist.findMany({
          where: { email: { equals: email, mode: "insensitive" }, eventId: { not: params.id } },
          include: { event: { select: { titleOriginal: true, eventDate: true } } },
          orderBy: { event: { eventDate: "desc" } },
          take: MAX_PAST_APPEARANCES,
        })
      : [];

  const transcriptSegments = [
    { label: formatEventLabel(panelist.event), text: panelist.transcriptSegment ?? "" },
    ...pastMatches.map((m) => ({ label: formatEventLabel(m.event), text: m.transcriptSegment ?? "" })),
  ];

  const hasUsableContent = transcriptSegments.some((s) => s.text.trim()) || !!panelist.bio;
  if (!hasUsableContent) {
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
      transcriptSegments,
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

  const promptDescription =
    pastMatches.length > 0
      ? `Guide generation for panelist ${panelist.name} (aggregated from ${pastMatches.length + 1} appearances)`
      : `Guide generation for panelist ${panelist.name}`;

  await prisma.aiContentLog.create({
    data: {
      panelistId: panelist.id,
      provider: "anthropic",
      contentType: "guide",
      prompt: promptDescription,
      output: JSON.stringify(generated),
    },
  });

  return NextResponse.json({ generated });
}
