import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Guide-download tracking (GuideDownload table) isn't part of the Phase
// 1 data model, so there's nothing to filter leads by here — returns an
// empty list so the leads page's "guide" filter dropdown still renders
// without breaking. See app/api/guide-download/route.ts for context.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ guides: [] });
}
