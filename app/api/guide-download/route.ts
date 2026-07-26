import { NextRequest, NextResponse } from "next/server";

// Disabled: GuideDownload (email-capture-on-PDF-download tracking) has
// no table in the BIE data model — Phase 1's gift buttons link straight
// to external panelist opt-in pages, there's no in-app email capture on
// a gift/guide click. Left in place, not deleted, in case a later phase
// wants download tracking back.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Guide download tracking is not part of Phase 1" },
    { status: 501 }
  );
}
