import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET, R2_PUBLIC_URL, buildObjectKey } from "@/lib/r2";
import { IMAGE_TYPES, IMAGE_MAX_BYTES } from "@/lib/uploadRules";

// Images only -- panelist-clips (video) uploads directly to R2 via a
// presigned URL (see /api/admin/upload/presign) instead of buffering
// through this route, after a 200MB video upload OOM-killed the
// container here (req.formData() + file.arrayBuffer() hold the whole
// file in memory before it ever reaches R2).
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

  if (!IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: `File is too large (max ${Math.round(IMAGE_MAX_BYTES / (1024 * 1024))}MB)` },
      { status: 400 }
    );
  }

  const key = buildObjectKey(folder, file.name);
  const bytes = await file.arrayBuffer();

  try {
    await R2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
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

  const publicUrl = `${R2_PUBLIC_URL}/${key}`;
  return NextResponse.json({ url: publicUrl, filename: key.split("/").pop() });
}
