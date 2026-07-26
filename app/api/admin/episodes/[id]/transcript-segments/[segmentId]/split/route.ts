import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPanelistTranscript } from "@/lib/syncPanelistTranscript";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; segmentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.transcriptSegment.findFirst({
    where: { id: params.segmentId, eventId: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Segment not found on this event" }, { status: 404 });
  }

  const body = await req.json();
  const splitAt: unknown = body.splitAt;
  if (typeof splitAt !== "number" || splitAt <= 0 || splitAt >= existing.text.length) {
    return NextResponse.json(
      { error: "splitAt must be a character offset strictly inside the segment text" },
      { status: 400 }
    );
  }

  const firstText = existing.text.slice(0, splitAt).trim();
  const secondText = existing.text.slice(splitAt).trim();
  if (!firstText || !secondText) {
    return NextResponse.json(
      { error: "Split point produces an empty segment" },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.transcriptSegment.updateMany({
      where: { eventId: params.id, order: { gt: existing.order } },
      data: { order: { increment: 1 } },
    });

    const updatedFirst = await tx.transcriptSegment.update({
      where: { id: existing.id },
      data: { text: firstText, status: "pending" },
      include: { matchedPanelist: { select: { id: true, name: true } } },
    });

    const newSecond = await tx.transcriptSegment.create({
      data: {
        eventId: existing.eventId,
        order: existing.order + 1,
        rawSpeakerLabel: existing.rawSpeakerLabel,
        text: secondText,
        matchedPanelistId: existing.matchedPanelistId,
        confidenceScore: existing.confidenceScore,
        isHostExcluded: existing.isHostExcluded,
        status: "pending",
      },
      include: { matchedPanelist: { select: { id: true, name: true } } },
    });

    return { first: updatedFirst, second: newSecond };
  });

  if (existing.matchedPanelistId) {
    await syncPanelistTranscript(existing.matchedPanelistId);
  }

  return NextResponse.json(result);
}
