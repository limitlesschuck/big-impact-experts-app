import { NextResponse } from "next/server";

// Disabled: the Captivate RSS integration assumed one-guest-per-episode
// fields (captivateId, episodeNumber) that don't exist on Event in the
// BIE data model. Left in place (not deleted) per the no-delete-without-
// an-explicit-ask rule, in case a future phase pulls in Chuck's own
// podcast RSS feed as a content source again.
export async function POST() {
  return NextResponse.json(
    { error: "Captivate ingestion is disabled in this app — not part of the Phase 1 Event/Panelist model" },
    { status: 501 }
  );
}
