import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isAdmin = searchParams.get("admin") === "true";

  const record = await prisma.siteConfig.findFirst();
  const config = record?.config ?? { episodeCardImage: "youtube_thumbnail" };

  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await prisma.siteConfig.findFirst();

    if (existing) {
      const updated = await prisma.siteConfig.update({
        where: { id: existing.id },
        data: { config: { ...(existing.config as object), ...body } },
      });
      return NextResponse.json(updated.config);
    }

    const created = await prisma.siteConfig.create({
      data: { config: body },
    });
    return NextResponse.json(created.config);
  } catch (err) {
    console.error("Site config PATCH error:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
