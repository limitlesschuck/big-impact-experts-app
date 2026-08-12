import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
  },
});

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "big-impact-experts-media";
export const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";

export function buildObjectKey(folder: string, originalFilename: string): string {
  const ext = originalFilename.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = originalFilename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  return `${folder}/${safeName}-${Date.now()}.${ext}`;
}

// Recovers the R2 object key from a stored public URL, for delete flows
// that only have the URL (headshotUrl/clipUrl/guidePdfUrl) on hand.
// Returns null for anything that isn't actually one of our R2 objects --
// clips and headshots both support a "paste an external URL" mode
// alongside upload, so a stored URL isn't guaranteed to be ours to
// delete. Also null if R2_PUBLIC_URL itself isn't configured, since an
// empty prefix would make every URL look like a (wrong) match.
export function extractR2Key(url: string | null | undefined): string | null {
  if (!url || !R2_PUBLIC_URL) return null;
  if (!url.startsWith(`${R2_PUBLIC_URL}/`)) return null;
  return url.slice(R2_PUBLIC_URL.length + 1);
}

// Best-effort batch delete -- callers treat failures here as non-fatal
// (the DB row is already the source of truth and is expected to already
// be gone by the time this runs), but still surface the error so the
// caller can report a cleanup warning rather than silently losing it.
export async function deleteR2Objects(keys: (string | null)[]): Promise<void> {
  const validKeys = keys.filter((k): k is string => !!k);
  if (validKeys.length === 0) return;

  await R2.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: { Objects: validKeys.map((Key) => ({ Key })) },
    })
  );
}
