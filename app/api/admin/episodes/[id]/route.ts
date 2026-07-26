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

  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
    include: {
      aiLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!episode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(episode);
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

  const allowed = [
    "titleYoutube",
    "titlePodcast",
    "descriptionYoutube",
    "descriptionWebsite",
    "guestName",
    "guestBio",
    "guestEmail",
    "affiliateLink",
    "swipeCopy",
    "systemeContactId",
    "crisisCategory",
    "tags",
    "publishStatus",
    "youtubeId",
    "mp4Url",
    "coverArtUrl",
    "youtubeThumbnailUrl",
    "captivateId",
    "guideBio",
    "guideFrameworks",
    "guideTakeaways",
    "guideQuotes",
    "guideActionItems",
    "guidePdfUrl",
    "ctaId",
    "slug",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const episode = await prisma.episode.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(episode);
}
