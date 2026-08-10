import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMemberAndSendWelcomeEmail } from "@/lib/memberAuth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
      expiresAt: true,
      lastLoginAt: true,
    },
  });

  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  const firstName = typeof body?.firstName === "string" ? body.firstName : undefined;
  const lastName = typeof body?.lastName === "string" ? body.lastName : undefined;

  try {
    const { member, created } = await createMemberAndSendWelcomeEmail(email, {
      firstName,
      lastName,
    });
    return NextResponse.json({
      member: { id: member.id, email: member.email, status: member.status },
      created,
      reason: created ? undefined : "already exists",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin member creation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
