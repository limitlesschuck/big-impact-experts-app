import { NextRequest, NextResponse } from "next/server";

// Disabled: depends on Episode.captivateId, which doesn't exist on
// Event. See app/api/admin/episodes/ingest/route.ts for context.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Captivate re-sync is disabled in this app — not part of the Phase 1 Event/Panelist model" },
    { status: 501 }
  );
}
