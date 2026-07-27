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

// Separate from getPublicEvent -- deliberately not shared, since the
// shape genuinely differs: this needs panelist titles/bio/hostNote for
// the registration page and has no reason to touch ToolEntry/gift
// data at all. Not gated on publishStatus: that field describes the
// post-event AI-content pipeline (draft -> ai_generated -> approved
// -> published), an unrelated concern to "is this event open for
// registration" -- an upcoming event being set up wouldn't have been
// through that pipeline yet. Visibility is controlled by the admin
// choosing who gets the link.
const REGISTRATION_EVENT_SELECT = {
  id: true,
  slug: true,
  titleOriginal: true,
  titleYoutube: true,
  descriptionWebsite: true,
  eventDate: true,
  hostName: true,
  hostTitle: true,
  hostHeadshotUrl: true,
  hostPhotoUrl: true,
  hostNote: true,
  registrationHeading: true,
  panelists: {
    select: {
      id: true,
      name: true,
      titleByline: true,
      titleAreaOfExpertise: true,
      headshotUrl: true,
      bio: true,
    },
  },
} as const;

export async function getPublicEventForRegistration(idOrSlug: string) {
  return prisma.event.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: REGISTRATION_EVENT_SELECT,
  });
}

// The permanent /register URL always resolves to whichever event is
// soonest in the future -- not gated by publishStatus, same reasoning
// as above.
export async function getSoonestUpcomingEvent() {
  return prisma.event.findFirst({
    where: { eventDate: { gte: new Date() } },
    orderBy: { eventDate: "asc" },
    select: REGISTRATION_EVENT_SELECT,
  });
}

export type PublicEventForRegistration = NonNullable<
  Awaited<ReturnType<typeof getPublicEventForRegistration>>
>;
