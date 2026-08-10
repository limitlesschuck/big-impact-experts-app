export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10MB

// video/quicktime (.mov -- what iPhones export by default) is deliberately
// excluded: most non-Safari browsers won't reliably play it through a
// plain <video> tag, and there's no transcoding step anywhere in this
// pipeline. MP4/WebM only, so "just point <video> at the URL" works.
export const VIDEO_TYPES = ["video/mp4", "video/webm"];
// Placeholder now that panelist-clips uploads go straight to R2 (see
// app/api/admin/upload/presign) instead of buffering through the Next.js
// process -- the old 25MB stopgap in the buffered route was specifically
// about protecting that process's memory, which no longer applies here.
// Adjust freely; nothing about this number is load-bearing anymore.
export const VIDEO_MAX_BYTES = 500 * 1024 * 1024; // 500MB
