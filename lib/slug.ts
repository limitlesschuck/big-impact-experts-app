export function generateSlug(params: {
  episodeNumber: number | null;
  titleYoutube: string | null;
  titleOriginal: string;
  guestName: string | null;
}): string {
  const num = params.episodeNumber
    ? `ep-${params.episodeNumber}`
    : null;

  const title = (params.titleYoutube ?? params.titleOriginal)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");

  const guest = params.guestName
    ? params.guestName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 30)
    : null;

  const parts = [num, title, guest].filter(Boolean);
  return parts.join("-");
}

export function isSlug(value: string): boolean {
  return /^ep-\d+/.test(value) || value.includes("-");
}
