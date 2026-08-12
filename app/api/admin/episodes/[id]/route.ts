import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_PANELISTS_PER_EVENT } from "@/lib/panelistLimits";
import { extractR2Key, deleteR2Objects } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      panelists: {
        include: {
          toolEntry: true,
          aiLogs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      transcriptSegments: {
        select: { status: true },
      },
      registrations: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Repeat-panelist detection for guide aggregation: one query for the
  // whole event (not one per panelist) that finds other Panelist rows
  // sharing an email with any panelist here, from other events.
  const nonEmptyEmails = Array.from(
    new Set(
      event.panelists
        .map((p) => p.email?.trim())
        .filter((e): e is string => !!e)
    )
  );

  const pastAppearancesByEmail = new Map<
    string,
    { id: string; titleOriginal: string; eventDate: Date }[]
  >();
  if (nonEmptyEmails.length > 0) {
    const matches = await prisma.panelist.findMany({
      where: {
        email: { in: nonEmptyEmails, mode: "insensitive" },
        eventId: { not: params.id },
      },
      select: {
        email: true,
        event: { select: { id: true, titleOriginal: true, eventDate: true } },
      },
    });
    for (const m of matches) {
      const key = m.email!.trim().toLowerCase();
      const list = pastAppearancesByEmail.get(key) ?? [];
      list.push(m.event);
      pastAppearancesByEmail.set(key, list);
    }
  }

  const panelistsWithAppearances = event.panelists.map((p) => {
    const key = p.email?.trim().toLowerCase();
    return {
      ...p,
      pastAppearances: key ? pastAppearancesByEmail.get(key) ?? [] : [],
    };
  });

  return NextResponse.json({ ...event, panelists: panelistsWithAppearances });
}

const EVENT_ALLOWED = [
  "titleOriginal",
  "titleYoutube",
  "titlePodcast",
  "descriptionOriginal",
  "descriptionYoutube",
  "descriptionWebsite",
  "tags",
  "publishStatus",
  "youtubeId",
  "mp4Url",
  "videoUrl",
  "audioUrl",
  "coverArtUrl",
  "thumbnailUrl",
  "youtubeThumbnailUrl",
  "slug",
  "eventDate",
  "hostName",
  "hostTitle",
  "hostHeadshotUrl",
  "hostPhotoUrl",
  "recordingUrl",
  "giftPublicUntil",
  "hostNote",
  "hostBio",
  "heroSubheading",
  "registrationHeading",
  "registrationSubheading",
  "surveyUrl",
  "eventType",
  "transcriptRaw",
  "transcriptCleaned",
];

const PANELIST_ALLOWED = [
  "name",
  "titleByline",
  "titleAreaOfExpertise",
  "bio",
  "shortBio",
  "headshotUrl",
  "clipUrl",
  "email",
  "affiliateLink",
  "swipeCopy",
  "transcriptSegment",
  "guideBio",
  "guideFrameworks",
  "guideTakeaways",
  "guideQuotes",
  "guideActionItems",
  "guidePdfUrl",
];

const TOOL_ENTRY_ALLOWED = [
  "freeGiftTitle",
  "freeGiftDescription",
  "freeGiftUrl",
  "vipGiftTitle",
  "vipGiftDescription",
  "vipGiftUrl",
  "featured",
];

interface PanelistPatch {
  id: string;
  toolEntry?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { panelists, ...eventBody } = body as {
    panelists?: PanelistPatch[];
    [key: string]: unknown;
  };

  const eventData: Record<string, unknown> = {};
  for (const key of EVENT_ALLOWED) {
    if (key in eventBody) eventData[key] = eventBody[key];
  }
  if (typeof eventData.eventDate === "string") {
    eventData.eventDate = new Date(eventData.eventDate as string);
  }
  if (typeof eventData.giftPublicUntil === "string") {
    eventData.giftPublicUntil = new Date(eventData.giftPublicUntil as string);
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (Object.keys(eventData).length > 0) {
        await tx.event.update({ where: { id: params.id }, data: eventData });
      }

      // Panelist rows added via the edit page's "+ Add panelist" arrive
      // with a client-generated temp-* id rather than a real one, since
      // they don't exist in the DB yet -- everything else about them
      // (bio, gift fields, etc.) goes through the same allowlist/save
      // flow as an existing panelist edit.
      const newPanelistCount = (panelists ?? []).filter((p) => p.id.startsWith("temp-")).length;
      if (newPanelistCount > 0) {
        const existingCount = await tx.panelist.count({ where: { eventId: params.id } });
        if (existingCount + newPanelistCount > MAX_PANELISTS_PER_EVENT) {
          throw new Error(
            `Adding ${newPanelistCount} panelist(s) would exceed the ${MAX_PANELISTS_PER_EVENT}-panelist limit (this event already has ${existingCount})`
          );
        }
      }

      for (const p of panelists ?? []) {
        const { id: panelistId, toolEntry, ...panelistBody } = p;

        const panelistData: Record<string, unknown> = {};
        for (const key of PANELIST_ALLOWED) {
          if (key in panelistBody) panelistData[key] = panelistBody[key];
        }

        let realPanelistId = panelistId;

        if (panelistId.startsWith("temp-")) {
          const name = typeof panelistData.name === "string" ? panelistData.name.trim() : "";
          if (!name) continue; // an unsaved "+ Add panelist" row that was never filled in
          const created = await tx.panelist.create({
            data: { ...panelistData, name, eventId: params.id } as never,
          });
          realPanelistId = created.id;
        } else if (Object.keys(panelistData).length > 0) {
          await tx.panelist.update({ where: { id: panelistId }, data: panelistData });
        }

        if (toolEntry) {
          const toolEntryData: Record<string, unknown> = {};
          for (const key of TOOL_ENTRY_ALLOWED) {
            if (key in toolEntry) toolEntryData[key] = toolEntry[key];
          }
          if (Object.keys(toolEntryData).length > 0) {
            await tx.toolEntry.upsert({
              where: { panelistId: realPanelistId },
              update: toolEntryData,
              create: { panelistId: realPanelistId, ...toolEntryData },
            });
          }
        }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { panelists: { include: { toolEntry: true } } },
  });

  return NextResponse.json(event);
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
  const confirmTitle = typeof body?.confirmTitle === "string" ? body.confirmTitle : "";

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      titleOriginal: true,
      panelists: { select: { id: true, headshotUrl: true, clipUrl: true, guidePdfUrl: true } },
    },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Re-validated server-side, same reasoning as Member delete -- a stray
  // or replayed DELETE request without a matching confirmTitle must not
  // be able to delete the row.
  if (confirmTitle !== event.titleOriginal) {
    return NextResponse.json(
      { error: "confirmTitle does not match this event's title" },
      { status: 400 }
    );
  }

  const panelistIds = event.panelists.map((p) => p.id);

  // DB rows first, R2 files after commit -- see the R2 cleanup comment
  // below for why the order matters here. Everything that references a
  // panelist or this event has to be cleared before the Panelist/Event
  // rows themselves can be deleted (no onDelete: Cascade is configured,
  // so Postgres rejects the delete otherwise).
  try {
    await prisma.$transaction([
      prisma.aiContentLog.deleteMany({ where: { panelistId: { in: panelistIds } } }),
      // Defensive: matchedPanelistId is meant to only ever point at a
      // panelist on the same event, but the FK doesn't enforce that --
      // null out any cross-event reference before these panelists are
      // gone, not just this event's own segments (deleted next).
      prisma.transcriptSegment.updateMany({
        where: { matchedPanelistId: { in: panelistIds } },
        data: { matchedPanelistId: null },
      }),
      prisma.toolEntry.deleteMany({ where: { panelistId: { in: panelistIds } } }),
      prisma.panelist.deleteMany({ where: { eventId: params.id } }),
      prisma.transcriptSegment.deleteMany({ where: { eventId: params.id } }),
      prisma.registration.deleteMany({ where: { eventId: params.id } }),
      prisma.publishLog.deleteMany({ where: { eventId: params.id } }),
      // Lead is the dormant Phase-3 funnel table (unused by BIE today)
      // with an optional sourceEventId -- defensively cleared rather
      // than assumed empty.
      prisma.lead.updateMany({ where: { sourceEventId: params.id }, data: { sourceEventId: null } }),
      prisma.event.delete({ where: { id: params.id } }),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("Event delete error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Best-effort, after the DB transaction has already committed -- an
  // orphaned R2 file (invisible to the app, nothing references it
  // anymore) is a much safer failure mode than the reverse order would
  // be: if R2 cleanup ran first and then the DB delete failed, the event
  // would still be live with broken image/video/PDF links.
  const keys = event.panelists.flatMap((p) => [
    extractR2Key(p.headshotUrl),
    extractR2Key(p.clipUrl),
    extractR2Key(p.guidePdfUrl),
  ]);
  let warning: string | undefined;
  try {
    await deleteR2Objects(keys);
  } catch (error) {
    console.error("R2 cleanup error after event delete:", error);
    warning = "Event deleted, but some files couldn't be removed from storage.";
  }

  return NextResponse.json({ success: true, warning });
}
