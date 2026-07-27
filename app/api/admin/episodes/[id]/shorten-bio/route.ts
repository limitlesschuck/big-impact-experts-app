import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shortenPanelistBio } from "@/lib/claude";

const DEFAULT_SHORT_BIO_MAX_LENGTH = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { panelistId } = await req.json();
  if (!panelistId) {
    return NextResponse.json({ error: "panelistId is required" }, { status: 400 });
  }

  const panelist = await prisma.panelist.findFirst({
    where: { id: panelistId, eventId: params.id },
  });

  if (!panelist) {
    return NextResponse.json({ error: "Panelist not found on this event" }, { status: 404 });
  }

  if (!panelist.bio) {
    return NextResponse.json(
      { error: "Panelist needs a bio before it can be shortened" },
      { status: 400 }
    );
  }

  const siteConfig = await prisma.siteConfig.findFirst();
  const configuredMaxLength = (siteConfig?.config as Record<string, unknown> | null)
    ?.shortBioMaxLength;
  const maxLength =
    typeof configuredMaxLength === "number" && configuredMaxLength > 0
      ? configuredMaxLength
      : DEFAULT_SHORT_BIO_MAX_LENGTH;

  let shortBio: string;
  try {
    shortBio = await shortenPanelistBio({
      panelistName: panelist.name,
      panelistBio: panelist.bio,
      maxLength,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Bio shortening error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await prisma.aiContentLog.create({
    data: {
      panelistId: panelist.id,
      provider: "anthropic",
      contentType: "short_bio",
      prompt: `Bio shortening for panelist ${panelist.name} (max ${maxLength} chars)`,
      output: shortBio,
    },
  });

  return NextResponse.json({ shortBio });
}
