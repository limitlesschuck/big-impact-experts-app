import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const record = await prisma.siteConfig.findFirst();
  return NextResponse.json(record?.config ?? { episodeCardImage: "youtube_thumbnail" });
}
