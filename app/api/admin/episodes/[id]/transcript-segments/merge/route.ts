import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPanelistTranscript } from "@/lib/syncPanelistTranscript";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const segmentIds: unknown = body.segmentIds;
  if (!Array.isArray(segmentIds) || segmentIds.length !== 2) {
    return NextResponse.json(
      { error: "segmentIds must contain exactly 2 segment ids" },
      { status: 400 }
    );
  }

  const segments = await prisma.transcriptSegment.findMany({
    where: { id: { in: segmentIds }, eventId: params.id },
    orderBy: { order: "asc" },
  });

  if (segments.length !== 2) {
    return NextResponse.json(
      { error: "Both segments must exist on this event" },
      { status: 404 }
    );
  }

  const [first, second] = segments;

  const sameApprovedMatch =
    first.status === "approved" &&
    second.status === "approved" &&
    first.matchedPanelistId === second.matchedPanelistId;

  const merged = await prisma.$transaction(async (tx) => {
    const updated = await tx.transcriptSegment.update({
      where: { id: first.id },
      data: {
        text: `${first.text} ${second.text}`,
        status: sameApprovedMatch ? "approved" : "pending",
        confidenceScore: sameApprovedMatch ? first.confidenceScore : null,
        matchedPanelistId: first.matchedPanelistId,
      },
      include: { matchedPanelist: { select: { id: true, name: true } } },
    });
    await tx.transcriptSegment.delete({ where: { id: second.id } });
    return updated;
  });

  const affectedPanelistIds = new Set(
    [first.matchedPanelistId, second.matchedPanelistId, merged.matchedPanelistId].filter(
      (id): id is string => !!id
    )
  );
  for (const panelistId of affectedPanelistIds) {
    await syncPanelistTranscript(panelistId);
  }

  return NextResponse.json({ segment: merged });
}
