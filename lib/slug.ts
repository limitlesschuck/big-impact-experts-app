export function generateSlug(params: {
  titleYoutube: string | null;
  titleOriginal: string;
  eventDate: Date | string | null;
}): string {
  const title = (params.titleYoutube ?? params.titleOriginal)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");

  const date = params.eventDate
    ? new Date(params.eventDate).toISOString().slice(0, 10)
    : null;

  const parts = [date, title].filter(Boolean);
  return parts.join("-");
}

export function isSlug(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}-/.test(value) || value.includes("-");
}
