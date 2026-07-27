import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json(event);
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
  "registrationHeading",
  "registrationSubheading",
  "transcriptRaw",
  "transcriptCleaned",
];

const PANELIST_ALLOWED = [
  "name",
  "titleByline",
  "titleAreaOfExpertise",
  "bio",
  "headshotUrl",
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

  await prisma.$transaction(async (tx) => {
    if (Object.keys(eventData).length > 0) {
      await tx.event.update({ where: { id: params.id }, data: eventData });
    }

    for (const p of panelists ?? []) {
      const { id: panelistId, toolEntry, ...panelistBody } = p;

      const panelistData: Record<string, unknown> = {};
      for (const key of PANELIST_ALLOWED) {
        if (key in panelistBody) panelistData[key] = panelistBody[key];
      }
      if (Object.keys(panelistData).length > 0) {
        await tx.panelist.update({ where: { id: panelistId }, data: panelistData });
      }

      if (toolEntry) {
        const toolEntryData: Record<string, unknown> = {};
        for (const key of TOOL_ENTRY_ALLOWED) {
          if (key in toolEntry) toolEntryData[key] = toolEntry[key];
        }
        if (Object.keys(toolEntryData).length > 0) {
          await tx.toolEntry.upsert({
            where: { panelistId },
            update: toolEntryData,
            create: { panelistId, ...toolEntryData },
          });
        }
      }
    }
  });

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { panelists: { include: { toolEntry: true } } },
  });

  return NextResponse.json(event);
}
