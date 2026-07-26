import { NextResponse } from "next/server";

// Disabled: depends on Episode.episodeNumber, which doesn't exist on
// Event. See app/api/admin/episodes/ingest/route.ts for context.
export async function POST() {
  return NextResponse.json(
    { error: "Episode number sync is disabled in this app — not part of the Phase 1 Event/Panelist model" },
    { status: 501 }
  );
}
