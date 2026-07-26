import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPanelistTranscript } from "@/lib/syncPanelistTranscript";

const VALID_STATUSES = ["pending", "approved", "rejected"];

export async function PATCH(
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
  const data: { matchedPanelistId?: string | null; status?: string; isHostExcluded?: boolean } = {};

  if ("matchedPanelistId" in body) {
    if (body.matchedPanelistId !== null) {
      const panelist = await prisma.panelist.findFirst({
        where: { id: body.matchedPanelistId, eventId: params.id },
      });
      if (!panelist) {
        return NextResponse.json(
          { error: "matchedPanelistId must belong to this event" },
          { status: 400 }
        );
      }
    }
    data.matchedPanelistId = body.matchedPanelistId;
    data.isHostExcluded = false;
  }

  if ("status" in body) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }

  const updated = await prisma.transcriptSegment.update({
    where: { id: params.segmentId },
    data,
    include: { matchedPanelist: { select: { id: true, name: true } } },
  });

  const affectedPanelistIds = new Set(
    [existing.matchedPanelistId, updated.matchedPanelistId].filter(
      (id): id is string => !!id
    )
  );
  for (const panelistId of affectedPanelistIds) {
    await syncPanelistTranscript(panelistId);
  }

  return NextResponse.json({ segment: updated });
}
