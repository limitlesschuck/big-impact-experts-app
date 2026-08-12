import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const body = await req.json();
  const { name, email } = body as { name?: string; email?: string };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // Gated the same as every other visitor-facing event query -- only
  // published events are registerable, regardless of eventDate. Without
  // this, a POST straight to this route with a draft/approved event's
  // id could register for it even though the register page itself would
  // never surface that event.
  const event = await prisma.event.findFirst({
    where: {
      publishStatus: "published",
      OR: [{ id: params.eventId }, { slug: params.eventId }],
    },
    select: { id: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // emailSynced stays false -- the outbound Systeme.io sync is a
  // separately planned task that will pick these rows up.
  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      name: name.trim(),
      email: normalizedEmail,
    },
  });

  // Drives the post-registration branch client-side: an existing member
  // gets a "welcome back, log in" message instead of the VIP upgrade
  // offer (they're already a member -- there's nothing to upsell). Same
  // lowercase-exact-match lookup already used for member login
  // (lib/auth.ts), not a case-insensitive search.
  const existingMember = await prisma.member.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  return NextResponse.json({
    success: true,
    registrationId: registration.id,
    alreadyMember: !!existingMember,
  });
}
