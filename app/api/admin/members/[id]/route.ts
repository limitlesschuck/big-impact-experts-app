import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MEMBER_ALLOWED = ["firstName", "lastName", "email", "expiresAt", "status"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const key of MEMBER_ALLOWED) {
    if (key in body) data[key] = body[key];
  }
  if (typeof data.email === "string") {
    data.email = data.email.trim().toLowerCase();
  }
  if (typeof data.expiresAt === "string") {
    data.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  try {
    const member = await prisma.member.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ member });
  } catch (error) {
    // Prisma unique-constraint violation on the email column.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Member update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const confirmEmail = typeof body?.confirmEmail === "string" ? body.confirmEmail : "";

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Re-validated server-side, not just gated client-side by the typed
  // confirmation in the admin UI -- a stray or replayed DELETE request
  // without a matching confirmEmail must not be able to delete the row.
  if (confirmEmail !== member.email) {
    return NextResponse.json(
      { error: "confirmEmail does not match this member's email" },
      { status: 400 }
    );
  }

  await prisma.member.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
