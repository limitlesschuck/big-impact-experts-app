import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = filter ? { publishStatus: filter } : {};

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { eventDate: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        eventDate: true,
        titleOriginal: true,
        titleYoutube: true,
        hostName: true,
        publishStatus: true,
        youtubeId: true,
        panelists: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, limit });
}
