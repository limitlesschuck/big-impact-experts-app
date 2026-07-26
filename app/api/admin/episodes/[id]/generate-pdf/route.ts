import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { EpisodeGuidePDF } from "@/lib/episode-guide-pdf";
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

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "limitless-living-media";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.limitlesslivingpodcast.com").replace(/\/$/, "");

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
  });

  if (!episode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!episode.guideBio && !episode.guideFrameworks) {
    return NextResponse.json(
      { error: "Generate episode guide content first before creating the PDF" },
      { status: 400 }
    );
  }

  try {
    const pdfElement = React.createElement(EpisodeGuidePDF, {
      showName: "Limitless Living Show",
      episodeTitle: episode.titleYoutube ?? episode.titleOriginal,
      episodeNumber: episode.episodeNumber,
      guestName: episode.guestName,
      guideBio: episode.guideBio ?? "",
      guideFrameworks: episode.guideFrameworks ?? "",
      guideTakeaways: episode.guideTakeaways ?? "",
      guideQuotes: episode.guideQuotes ?? "",
      guideActionItems: episode.guideActionItems ?? "",
      assessmentUrl: `${APP_URL || "https://www.limitlesslivingpodcast.com"}/assessment`,
    }) as unknown as React.ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(pdfElement);

    const slug = episode.slug ?? episode.id;
    const filename = `episode-guides/${slug}-guide.pdf`;

    await R2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: filename,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );

    const pdfUrl = `${PUBLIC_URL}/${filename}`;

    await prisma.episode.update({
      where: { id: episode.id },
      data: { guidePdfUrl: pdfUrl },
    });

    return NextResponse.json({ pdfUrl, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed";
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
