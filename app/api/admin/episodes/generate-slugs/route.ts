import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { slug: null },
    select: {
      id: true,
      titleYoutube: true,
      titleOriginal: true,
      eventDate: true,
    },
  });

  let updated = 0;
  const errors: string[] = [];

  for (const ev of events) {
    let slug = generateSlug({
      titleYoutube: ev.titleYoutube,
      titleOriginal: ev.titleOriginal,
      eventDate: ev.eventDate,
    });

    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing && existing.id !== ev.id) {
      slug = `${slug}-${ev.id.slice(-4)}`;
    }

    try {
      await prisma.event.update({
        where: { id: ev.id },
        data: { slug },
      });
      updated++;
    } catch {
      errors.push(ev.id);
    }
  }

  return NextResponse.json({
    updated,
    errors,
    message: `Generated slugs for ${updated} events`,
  });
}
