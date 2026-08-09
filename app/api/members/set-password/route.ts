import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/memberAuth";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  const member = await prisma.member.findFirst({
    where: {
      passwordResetToken: hashResetToken(token),
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: "This link is invalid or has expired" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.member.update({
    where: { id: member.id },
    data: {
      password: passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return NextResponse.json({ success: true });
}
