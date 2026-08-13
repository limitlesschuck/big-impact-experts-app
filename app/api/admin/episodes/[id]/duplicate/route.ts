import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const eventDate = typeof body?.eventDate === "string" ? body.eventDate : "";
  if (!eventDate) {
    return NextResponse.json({ error: "Event date is required" }, { status: 400 });
  }
  const eventDateObj = new Date(eventDate);
  if (Number.isNaN(eventDateObj.getTime())) {
    return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
  }

  const source = await prisma.event.findUnique({ where: { id: params.id } });
  if (!source) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const slug = generateSlug({
    titleYoutube: source.titleYoutube,
    titleOriginal: source.titleOriginal,
    eventDate: eventDateObj,
  });

  const duplicate = await prisma.event.create({
    data: {
      slug,
      eventDate: eventDateObj,

      // Title
      titleOriginal: source.titleOriginal,
      titleYoutube: source.titleYoutube,
      titlePodcast: source.titlePodcast,

      // Description
      descriptionOriginal: source.descriptionOriginal,
      descriptionYoutube: source.descriptionYoutube,
      descriptionWebsite: source.descriptionWebsite,

      // Content
      tags: source.tags,
      eventType: source.eventType,
      heroSubheading: source.heroSubheading,
      registrationHeading: source.registrationHeading,
      registrationSubheading: source.registrationSubheading,
      surveyUrl: source.surveyUrl,
      coverArtUrl: source.coverArtUrl,

      // Host
      hostName: source.hostName,
      hostTitle: source.hostTitle,
      hostHeadshotUrl: source.hostHeadshotUrl,
      hostPhotoUrl: source.hostPhotoUrl,
      hostNote: source.hostNote,
      hostBio: source.hostBio,

      // Recomputed from the new date
      giftPublicUntil: new Date(eventDateObj.getTime() + 72 * 60 * 60 * 1000),

      // Reset -- the duplicate has no recording, transcript, or
      // registrations of its own yet, and always starts as a draft
      // with no panelists regardless of the source event's state.
      publishStatus: "draft",
      publishedAt: null,
      recordingUrl: null,
      transcriptRaw: null,
      transcriptCleaned: null,
      youtubeId: null,
      youtubeThumbnailUrl: null,
      thumbnailUrl: null,
      audioUrl: null,
      videoUrl: null,
      mp4Url: null,
      durationSeconds: null,
    },
  });

  return NextResponse.json({ id: duplicate.id, success: true });
}
