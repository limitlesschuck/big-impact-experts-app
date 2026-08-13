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
  const referredBy = searchParams.get("referredBy");

  const registrations = await prisma.registration.findMany({
    where: referredBy ? { referredBy } : {},
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { id: true, titleOriginal: true } },
    },
  });

  return NextResponse.json({ registrations });
}
