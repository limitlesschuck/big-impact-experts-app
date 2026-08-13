import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSystemeConfig } from "@/lib/siteConfig";
import { syncRegistrationToSysteme } from "@/lib/systeme";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const body = await req.json();
  const { name, email, referredBy } = body as {
    name?: string;
    email?: string;
    referredBy?: string;
  };

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
  const trimmedReferredBy = referredBy?.trim() || null;

  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      name: name.trim(),
      email: normalizedEmail,
      referredBy: trimmedReferredBy,
    },
  });

  // Best-effort, after the row is already saved -- a sync failure must
  // never block registration. emailSynced stays false so it's visible in
  // the admin Registrations report for manual follow-up.
  const systemeConfig = await getSystemeConfig();
  const synced = await syncRegistrationToSysteme({
    email: normalizedEmail,
    name: name.trim(),
    referredBy: trimmedReferredBy,
    referralFieldSlug: systemeConfig.referralFieldSlug,
  });
  if (synced) {
    await prisma.registration.update({
      where: { id: registration.id },
      data: { emailSynced: true },
    });
  }

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
