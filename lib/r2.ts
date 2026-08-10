import { S3Client } from "@aws-sdk/client-s3";

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
