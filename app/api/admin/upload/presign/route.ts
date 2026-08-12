import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2, R2_BUCKET, R2_PUBLIC_URL, buildObjectKey } from "@/lib/r2";
import { VIDEO_TYPES, VIDEO_MAX_BYTES } from "@/lib/uploadRules";

const PRESIGNED_URL_TTL_SECONDS = 300;

// Panelist clips and Sales Page testimonial videos share this route but
// land in separate R2 folders for organization -- allowlisted rather than
// accepting any string, since this becomes part of the object key.
const ALLOWED_FOLDERS = ["panelist-clips", "testimonials"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

// Issues a short-lived, size-locked presigned PUT URL for a video clip so
// the browser can upload directly to R2 -- this process's memory never
// holds the file at all, unlike /api/admin/upload's buffered path.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const filename = typeof body?.filename === "string" ? body.filename : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const fileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;

  if (!filename || !contentType || !fileSize) {
    return NextResponse.json(
      { error: "filename, contentType, and fileSize are required" },
      { status: 400 }
    );
  }

  if (!VIDEO_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Only MP4 or WebM video files are allowed" },
      { status: 400 }
    );
  }

  if (fileSize > VIDEO_MAX_BYTES) {
    return NextResponse.json(
      { error: `File is too large (max ${Math.round(VIDEO_MAX_BYTES / (1024 * 1024))}MB)` },
      { status: 400 }
    );
  }

  const requestedFolder = typeof body?.folder === "string" ? body.folder : "panelist-clips";
  const folder: AllowedFolder = ALLOWED_FOLDERS.includes(requestedFolder as AllowedFolder)
    ? (requestedFolder as AllowedFolder)
    : "panelist-clips";

  const key = buildObjectKey(folder, filename);

  // Signing with ContentLength included is what actually enforces the size
  // cap here -- the signature is only valid for a PUT whose body is
  // exactly this many bytes, so R2 itself rejects a mismatched upload
  // rather than relying solely on a check the client could skip.
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: fileSize,
  });

  let uploadUrl: string;
  try {
    uploadUrl = await getSignedUrl(R2, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Presign error:", error);
    return NextResponse.json({ error: `Failed to create upload URL: ${message}` }, { status: 500 });
  }

  const publicUrl = `${R2_PUBLIC_URL}/${key}`;
  return NextResponse.json({ uploadUrl, publicUrl });
}
