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

  const event = await prisma.event.findFirst({
    where: { OR: [{ id: params.eventId }, { slug: params.eventId }] },
    select: { id: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // emailSynced stays false -- the outbound Systeme.io sync is a
  // separately planned task that will pick these rows up.
  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    },
  });

  return NextResponse.json({ success: true, registrationId: registration.id });
}
