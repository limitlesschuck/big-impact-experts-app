import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10MB

// video/quicktime (.mov -- what iPhones export by default) is deliberately
// excluded: most non-Safari browsers won't reliably play it through a
// plain <video> tag, and this route has no transcoding step to fall back
// on. MP4/WebM only, so "just point <video> at the URL" actually works.
// TEMPORARY: this route buffers the whole request body in memory
// (req.formData() + file.arrayBuffer()) before ever writing to R2, which
// OOM-killed the container on a 200MB video upload and crash-looped the
// whole service (Railway logs: "Ready" then "Stopping Container" ~3s
// later, mid-request). Capped low here as an immediate stopgap while
// panelist-clips moves to a presigned direct-to-R2 upload that never
// routes bytes through this process -- raise this back up once that's in
// place, since memory usage will no longer scale with file size.
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const VIDEO_MAX_BYTES = 25 * 1024 * 1024; // 25MB

const FOLDER_RULES: Record<string, { types: string[]; maxBytes: number; label: string }> = {
  "panelist-clips": { types: VIDEO_TYPES, maxBytes: VIDEO_MAX_BYTES, label: "MP4 or WebM video" },
};
const DEFAULT_RULE = { types: IMAGE_TYPES, maxBytes: IMAGE_MAX_BYTES, label: "JPEG, PNG, or WebP image" };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) ?? "episode-art";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const rule = FOLDER_RULES[folder] ?? DEFAULT_RULE;

  if (!rule.types.includes(file.type)) {
    return NextResponse.json(
      { error: `Only ${rule.label} files are allowed` },
      { status: 400 }
    );
  }

  if (file.size > rule.maxBytes) {
    return NextResponse.json(
      { error: `File is too large (max ${Math.round(rule.maxBytes / (1024 * 1024))}MB)` },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  const filename = `${safeName}-${Date.now()}.${ext}`;
  const key = `${folder}/${filename}`;

  const bytes = await file.arrayBuffer();

  try {
    await R2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(bytes),
        ContentType: file.type,
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("R2 upload error:", message);
    return NextResponse.json({ error: `R2 upload failed: ${message}` }, { status: 500 });
  }

  const publicUrl = `${PUBLIC_URL}/${key}`;
  return NextResponse.json({ url: publicUrl, filename });
}
