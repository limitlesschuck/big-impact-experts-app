import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { PanelistGuidePDF } from "@/lib/episode-guide-pdf";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import React from "react";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "big-impact-experts-media";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";

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
    include: { event: true, toolEntry: true },
  });

  if (!panelist) {
    return NextResponse.json({ error: "Panelist not found on this event" }, { status: 404 });
  }

  if (!panelist.guideBio && !panelist.guideFrameworks) {
    return NextResponse.json(
      { error: "Generate the panelist guide content first before creating the PDF" },
      { status: 400 }
    );
  }

  try {
    const pdfElement = React.createElement(PanelistGuidePDF, {
      panelistName: panelist.name,
      headshotUrl: panelist.headshotUrl,
      guideBio: panelist.guideBio ?? "",
      guideFrameworks: panelist.guideFrameworks ?? "",
      guideTakeaways: panelist.guideTakeaways ?? "",
      guideQuotes: panelist.guideQuotes ?? "",
      guideActionItems: panelist.guideActionItems ?? "",
      freeGiftTitle: panelist.toolEntry?.freeGiftTitle,
      freeGiftDescription: panelist.toolEntry?.freeGiftDescription,
      freeGiftUrl: panelist.toolEntry?.freeGiftUrl,
    }) as unknown as React.ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(pdfElement);

    const eventSlug = panelist.event.slug ?? panelist.event.id;
    const filename = `panelist-guides/${eventSlug}-${panelist.id}-guide-${Date.now()}.pdf`;

    await R2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: filename,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );

    const pdfUrl = `${PUBLIC_URL}/${filename}`;

    await prisma.panelist.update({
      where: { id: panelist.id },
      data: { guidePdfUrl: pdfUrl },
    });

    return NextResponse.json({ pdfUrl, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed";
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
