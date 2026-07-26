import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.assessmentConfig.findFirst();
  return NextResponse.json(config ?? { config: {} });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const existing = await prisma.assessmentConfig.findFirst();

  if (existing) {
    const updated = await prisma.assessmentConfig.update({
      where: { id: existing.id },
      data: { config: body.config },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.assessmentConfig.create({
    data: { config: body.config },
  });
  return NextResponse.json(created);
}
