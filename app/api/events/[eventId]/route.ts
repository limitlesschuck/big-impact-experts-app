import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;

  const event = await prisma.event.findFirst({
    where: {
      publishStatus: "published",
      OR: [{ id: eventId }, { slug: eventId }],
    },
    include: {
      panelists: { include: { toolEntry: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}
