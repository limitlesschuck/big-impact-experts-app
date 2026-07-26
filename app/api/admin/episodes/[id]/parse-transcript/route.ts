import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  parseVttToSegments,
  matchSpeaker,
  HOST_MATCH_THRESHOLD,
} from "@/lib/transcriptMatching";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { panelists: { select: { id: true, name: true } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (!event.transcriptRaw?.trim()) {
    return NextResponse.json(
      { error: "This event has no transcript uploaded yet" },
      { status: 400 }
    );
  }

  const parsed = parseVttToSegments(event.transcriptRaw);
  if (parsed.length === 0) {
    return NextResponse.json(
      { error: "Could not parse any speaker-labeled segments from this transcript" },
      { status: 400 }
    );
  }

  const panelistCandidates = event.panelists.map((p) => ({ id: p.id, name: p.name }));

  const toCreate = parsed.map((seg) => {
    if (event.hostName?.trim()) {
      const hostMatch = matchSpeaker(seg.rawSpeakerLabel, [
        { id: "__host__", name: event.hostName },
      ]);
      if (
        hostMatch.confidenceScore !== null &&
        hostMatch.confidenceScore >= HOST_MATCH_THRESHOLD
      ) {
        return {
          rawSpeakerLabel: seg.rawSpeakerLabel,
          text: seg.text,
          matchedPanelistId: null,
          confidenceScore: hostMatch.confidenceScore,
          isHostExcluded: true,
          status: "pending" as const,
        };
      }
    }

    const match = matchSpeaker(seg.rawSpeakerLabel, panelistCandidates);
    return {
      rawSpeakerLabel: seg.rawSpeakerLabel,
      text: seg.text,
      matchedPanelistId: match.matchedId,
      confidenceScore: match.confidenceScore,
      isHostExcluded: false,
      status: "pending" as const,
    };
  });

  const result = await prisma.$transaction(async (tx) => {
    // Keep approved segments untouched; regenerate everything else.
    await tx.transcriptSegment.deleteMany({
      where: { eventId: event.id, status: { in: ["pending", "rejected"] } },
    });

    const maxApprovedOrder = await tx.transcriptSegment.aggregate({
      where: { eventId: event.id, status: "approved" },
      _max: { order: true },
    });
    const startOrder = (maxApprovedOrder._max.order ?? -1) + 1;

    await tx.transcriptSegment.createMany({
      data: toCreate.map((seg, i) => ({
        eventId: event.id,
        order: startOrder + i,
        ...seg,
      })),
    });

    return tx.transcriptSegment.findMany({
      where: { eventId: event.id },
      orderBy: { order: "asc" },
      include: { matchedPanelist: { select: { id: true, name: true } } },
    });
  });

  return NextResponse.json({ segments: result });
}
