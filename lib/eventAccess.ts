import { prisma } from "@/lib/prisma";

// Public Event Page gating (phase-1-spec-addendum.md Section 6). Only
// used by the public page/API -- the future Member Dashboard doesn't
// need this at all, since member access is gated purely by
// Member.status, not by this date window.
export function isGiftPublicWindow(event: { giftPublicUntil: Date | null }): boolean {
  if (!event.giftPublicUntil) return true;
  return new Date() < event.giftPublicUntil;
}

// Public-safe event fetch, shared by the public Event Page and the
// public /api/events/[eventId] route. Deliberately never selects VIP
// gift fields -- VIP gifts are members-only per Section 5 and must
// never be exposed on a public surface, even structurally in an API
// response a UI happens not to render.
export async function getPublicEvent(idOrSlug: string) {
  return prisma.event.findFirst({
    where: {
      publishStatus: "published",
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: {
      id: true,
      slug: true,
      titleOriginal: true,
      titleYoutube: true,
      eventDate: true,
      recordingUrl: true,
      giftPublicUntil: true,
      panelists: {
        select: {
          id: true,
          name: true,
          headshotUrl: true,
          toolEntry: {
            select: {
              freeGiftTitle: true,
              freeGiftDescription: true,
              freeGiftUrl: true,
            },
          },
        },
      },
    },
  });
}

export type PublicEvent = NonNullable<Awaited<ReturnType<typeof getPublicEvent>>>;
