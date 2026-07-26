import { NextRequest, NextResponse } from "next/server";

// Disabled: this generated YouTube/podcast title & description variants
// from riversideTitle/riversideKeywords/crisisCategory/episodeNumber —
// none of which exist on Event. There's no Phase 1 BIE requirement for
// event-level multi-platform title generation (the spec's AI generation
// step is per-panelist guide content, see generate-guide/route.ts).
// Left in place, not deleted, in case a future phase wants this back.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Event-level AI title/description generation is disabled — use per-panelist guide generation instead" },
    { status: 501 }
  );
}
