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
  eventDate: true,
  hostName: true,
  hostTitle: true,
  hostHeadshotUrl: true,
  hostPhotoUrl: true,
  hostNote: true,
  hostBio: true,
  heroSubheading: true,
  registrationHeading: true,
  registrationSubheading: true,
  surveyUrl: true,
  panelists: {
    select: {
      id: true,
      name: true,
      titleByline: true,
      titleAreaOfExpertise: true,
      headshotUrl: true,
      bio: true,
      shortBio: true,
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

// ── Member Dashboard ─────────────────────────────────────────────────
// Access is gated purely by Member.status (checked live in
// app/dashboard/layout.tsx, since a JWT can't carry mutable state) plus
// eventDate being in the past -- not publishStatus, which tracks the
// admin's internal AI-content pipeline and is orthogonal to whether a
// member should be able to see an event they attended, same reasoning
// as REGISTRATION_EVENT_SELECT above. The past-events gate is re-applied
// at every level (list, detail, per-expert), not just the list -- a
// filtered-out list item is not access control if the detail route
// underneath it doesn't enforce the same rule.

export async function getEpisodeCardImagePreference(): Promise<"youtube_thumbnail" | "cover_art"> {
  const record = await prisma.siteConfig.findFirst();
  const config = record?.config as Record<string, unknown> | null;
  return config?.episodeCardImage === "cover_art" ? "cover_art" : "youtube_thumbnail";
}

export function pickEpisodeThumbnail(
  event: { youtubeThumbnailUrl: string | null; coverArtUrl: string | null; thumbnailUrl: string | null },
  preference: "youtube_thumbnail" | "cover_art"
): string | null {
  const preferred = preference === "cover_art" ? event.coverArtUrl : event.youtubeThumbnailUrl;
  const fallback = preference === "cover_art" ? event.youtubeThumbnailUrl : event.coverArtUrl;
  return preferred || fallback || event.thumbnailUrl || null;
}

export async function getMemberDashboardEvents() {
  return prisma.event.findMany({
    where: { eventDate: { lt: new Date() } },
    orderBy: { eventDate: "desc" },
    select: {
      id: true,
      titleOriginal: true,
      titleYoutube: true,
      eventDate: true,
      youtubeThumbnailUrl: true,
      coverArtUrl: true,
      thumbnailUrl: true,
    },
  });
}

export type MemberDashboardEventListItem = Awaited<
  ReturnType<typeof getMemberDashboardEvents>
>[number];

export async function getMemberDashboardEvent(eventId: string) {
  return prisma.event.findFirst({
    where: { id: eventId, eventDate: { lt: new Date() } },
    select: {
      id: true,
      titleOriginal: true,
      titleYoutube: true,
      eventDate: true,
      recordingUrl: true,
      panelists: {
        select: {
          id: true,
          name: true,
          titleByline: true,
          titleAreaOfExpertise: true,
          headshotUrl: true,
        },
      },
    },
  });
}

export type MemberDashboardEvent = NonNullable<Awaited<ReturnType<typeof getMemberDashboardEvent>>>;

export async function getMemberDashboardPanelist(eventId: string, panelistId: string) {
  return prisma.panelist.findFirst({
    where: {
      id: panelistId,
      eventId,
      event: { eventDate: { lt: new Date() } },
    },
    select: {
      id: true,
      name: true,
      titleByline: true,
      titleAreaOfExpertise: true,
      clipUrl: true,
      guidePdfUrl: true,
      event: { select: { id: true, titleOriginal: true, titleYoutube: true } },
      toolEntry: {
        select: {
          freeGiftTitle: true,
          freeGiftDescription: true,
          freeGiftUrl: true,
          vipGiftTitle: true,
          vipGiftDescription: true,
          vipGiftUrl: true,
        },
      },
    },
  });
}

export type MemberDashboardPanelist = NonNullable<
  Awaited<ReturnType<typeof getMemberDashboardPanelist>>
>;

// Not deduped by email -- rows stay independent per event appearance,
// matching what was already established for guide aggregation: no
// canonical-person table, same panelist at three events is three rows
// (and here, three directory cards, each linking to that specific
// event's per-expert page).
export async function getDirectoryPanelists() {
  return prisma.panelist.findMany({
    where: { event: { eventDate: { lt: new Date() } } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      eventId: true,
      name: true,
      titleByline: true,
      titleAreaOfExpertise: true,
      headshotUrl: true,
      bio: true,
      shortBio: true,
    },
  });
}

export type DirectoryPanelist = Awaited<ReturnType<typeof getDirectoryPanelists>>[number];

// Public marketing-page teaser grids (Home "Meet Our Experts", Sales page
// "Learn From The Best Experts"). Selection is a simple recency
// heuristic -- the panelists from the most recently occurred events --
// rather than a curated "featured" flag: ToolEntry.featured exists in the
// schema but has no admin UI to set it and no other consumer, and
// building that curation UI is a larger feature than either page asked
// for. Same past-events pool as getDirectoryPanelists, so anyone shown in
// a teaser is also findable in the full directory it links to.
export async function getFeaturedPanelists(limit: number) {
  return prisma.panelist.findMany({
    where: { event: { eventDate: { lt: new Date() } } },
    orderBy: { event: { eventDate: "desc" } },
    take: limit,
    select: {
      id: true,
      eventId: true,
      name: true,
      titleByline: true,
      titleAreaOfExpertise: true,
      headshotUrl: true,
      bio: true,
      shortBio: true,
    },
  });
}

export type FeaturedPanelist = Awaited<ReturnType<typeof getFeaturedPanelists>>[number];

// Candidate pool for the Expert Match widget. Same past-events gate as
// the rest of the dashboard, plus guideBio not null -- a panelist with
// no generated guide content has nothing to ground a recommendation in,
// so they're excluded from the pool entirely rather than being a
// candidate that could never legitimately be recommended.
export async function getExpertMatchPool() {
  return prisma.panelist.findMany({
    where: {
      event: { eventDate: { lt: new Date() } },
      guideBio: { not: null },
    },
    select: {
      id: true,
      eventId: true,
      name: true,
      titleByline: true,
      titleAreaOfExpertise: true,
      guideBio: true,
      guideFrameworks: true,
      guideTakeaways: true,
      guideQuotes: true,
      guideActionItems: true,
    },
  });
}

export type ExpertMatchPoolPanelist = Awaited<ReturnType<typeof getExpertMatchPool>>[number];
