import { NextRequest, NextResponse } from "next/server";
import { getPublicEvent, isGiftPublicWindow } from "@/lib/eventAccess";

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const event = await getPublicEvent(params.eventId);

  if (!event || !isGiftPublicWindow(event)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}
