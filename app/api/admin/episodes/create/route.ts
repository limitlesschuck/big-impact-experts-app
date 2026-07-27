import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

interface PanelistInput {
  name: string;
  titleByline?: string;
  titleAreaOfExpertise?: string;
  bio?: string;
  headshotUrl?: string;
  email?: string;
  freeGiftTitle?: string;
  freeGiftDescription?: string;
  freeGiftUrl?: string;
  vipGiftTitle?: string;
  vipGiftDescription?: string;
  vipGiftUrl?: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    titleOriginal,
    eventDate,
    hostName,
    recordingUrl,
    transcriptRaw,
    panelists,
  }: {
    titleOriginal: string;
    eventDate: string;
    hostName?: string;
    recordingUrl?: string;
    transcriptRaw?: string;
    panelists?: PanelistInput[];
  } = body;

  if (!titleOriginal || !eventDate) {
    return NextResponse.json(
      { error: "Event title and event date are required" },
      { status: 400 }
    );
  }

  const eventDateObj = new Date(eventDate);
  const slug = generateSlug({
    titleYoutube: null,
    titleOriginal,
    eventDate: eventDateObj,
  });

  // Snapshot the default host profile at creation time -- editable per
  // event afterward, not a live reference to SiteConfig.
  const siteConfig = await prisma.siteConfig.findFirst();
  const defaultHost =
    (siteConfig?.config as Record<string, unknown> | null)?.defaultHost as
      | { name?: string; title?: string; headshotUrl?: string; photoUrl?: string }
      | undefined;

  const event = await prisma.event.create({
    data: {
      slug,
      titleOriginal,
      eventDate: eventDateObj,
      hostName: hostName || defaultHost?.name || null,
      hostTitle: defaultHost?.title || "Affiliate Management Expert",
      hostHeadshotUrl: defaultHost?.headshotUrl || null,
      hostPhotoUrl: defaultHost?.photoUrl || null,
      recordingUrl: recordingUrl || null,
      transcriptRaw: transcriptRaw || null,
      giftPublicUntil: new Date(eventDateObj.getTime() + 72 * 60 * 60 * 1000),
      publishStatus: "draft",
      panelists: {
        create: (panelists ?? [])
          .filter((p) => p.name?.trim())
          .map((p) => ({
            name: p.name,
            titleByline: p.titleByline || null,
            titleAreaOfExpertise: p.titleAreaOfExpertise || null,
            bio: p.bio || null,
            headshotUrl: p.headshotUrl || null,
            email: p.email || null,
            toolEntry: {
              create: {
                freeGiftTitle: p.freeGiftTitle || null,
                freeGiftDescription: p.freeGiftDescription || null,
                freeGiftUrl: p.freeGiftUrl || null,
                vipGiftTitle: p.vipGiftTitle || null,
                vipGiftDescription: p.vipGiftDescription || null,
                vipGiftUrl: p.vipGiftUrl || null,
              },
            },
          })),
      },
    },
  });

  return NextResponse.json({ id: event.id, success: true });
}
