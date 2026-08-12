import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractR2Key, deleteR2Objects } from "@/lib/r2";

// Delete-only -- panelist field edits go through the parent event's
// PATCH /api/admin/episodes/[id] (an upsert-shaped loop over a
// `panelists` array). Delete needs its own confirm re-validation,
// cascade, and R2 cleanup, which doesn't fit that shared loop, so it
// gets its own route rather than being bolted on there.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; panelistId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const confirmName = typeof body?.confirmName === "string" ? body.confirmName : "";

  const panelist = await prisma.panelist.findFirst({
    where: { id: params.panelistId, eventId: params.id },
    select: { id: true, name: true, headshotUrl: true, clipUrl: true, guidePdfUrl: true },
  });
  if (!panelist) {
    return NextResponse.json({ error: "Panelist not found on this event" }, { status: 404 });
  }

  // Re-validated server-side, same reasoning as Member/Event delete.
  if (confirmName !== panelist.name) {
    return NextResponse.json(
      { error: "confirmName does not match this panelist's name" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.aiContentLog.deleteMany({ where: { panelistId: panelist.id } }),
      prisma.transcriptSegment.updateMany({
        where: { matchedPanelistId: panelist.id },
        data: { matchedPanelistId: null },
      }),
      prisma.toolEntry.deleteMany({ where: { panelistId: panelist.id } }),
      prisma.panelist.delete({ where: { id: panelist.id } }),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("Panelist delete error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Best-effort, after the DB transaction has already committed -- see
  // the equivalent comment on the event DELETE route for why this order.
  const keys = [
    extractR2Key(panelist.headshotUrl),
    extractR2Key(panelist.clipUrl),
    extractR2Key(panelist.guidePdfUrl),
  ];
  let warning: string | undefined;
  try {
    await deleteR2Objects(keys);
  } catch (error) {
    console.error("R2 cleanup error after panelist delete:", error);
    warning = "Panelist deleted, but some files couldn't be removed from storage.";
  }

  return NextResponse.json({ success: true, warning });
}
