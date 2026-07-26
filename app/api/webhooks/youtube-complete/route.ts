import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.eventId || !body?.youtubeUrl) {
    return NextResponse.json(
      { error: "eventId and youtubeUrl are required" },
      { status: 400 }
    );
  }

  const youtubeId = body.youtubeUrl.includes("watch?v=")
    ? body.youtubeUrl.split("watch?v=")[1].split("&")[0]
    : body.youtubeUrl.split("/").pop() ?? body.youtubeUrl;

  const event = await prisma.event.update({
    where: { id: body.eventId },
    data: {
      youtubeId,
      publishStatus: "published",
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    eventId: event.id,
    youtubeId,
  });
}
