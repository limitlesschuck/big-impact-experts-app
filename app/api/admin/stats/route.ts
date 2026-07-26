import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [events, leads, expertReferrals, pendingEvents] = await Promise.all([
    prisma.event.count(),
    prisma.lead.count(),
    prisma.expertReferral.count(),
    prisma.event.count({ where: { publishStatus: "approved" } }),
  ]);

  return NextResponse.json({ events, leads, expertReferrals, pendingEvents });
}
