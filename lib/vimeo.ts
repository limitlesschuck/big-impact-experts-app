export interface ParsedVimeoUrl {
  id: string;
  hash: string | null;
}

// Handles the URL shapes Vimeo actually produces, not just the canonical
// vimeo.com/{id} form. The /{id}/{hash} and ?h={hash} shapes matter most --
// that hash is what makes an unlisted (privacy: "anyone with the link")
// video embeddable at all; dropping it silently breaks playback for
// exactly the kind of video an event replay is likely to be.
export function parseVimeoUrl(rawUrl: string): ParsedVimeoUrl | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);

  // player.vimeo.com/video/{id}[?h={hash}]
  if (host === "player.vimeo.com") {
    if (segments[0] !== "video" || !segments[1] || !/^\d+$/.test(segments[1])) return null;
    return { id: segments[1], hash: url.searchParams.get("h") };
  }

  // vimeo.com/{id}[/{hash}]
  if (segments.length >= 1 && /^\d+$/.test(segments[0])) {
    const hash = segments[1] && /^[a-zA-Z0-9]+$/.test(segments[1]) ? segments[1] : url.searchParams.get("h");
    return { id: segments[0], hash };
  }

  // vimeo.com/channels/{name}/{id}
  if (segments[0] === "channels" && segments[2] && /^\d+$/.test(segments[2])) {
    return { id: segments[2], hash: url.searchParams.get("h") };
  }

  // vimeo.com/groups/{name}/videos/{id}
  if (segments[0] === "groups" && segments[2] === "videos" && segments[3] && /^\d+$/.test(segments[3])) {
    return { id: segments[3], hash: url.searchParams.get("h") };
  }

  return null;
}

export function buildVimeoEmbedUrl(parsed: ParsedVimeoUrl): string {
  const base = `https://player.vimeo.com/video/${parsed.id}`;
  return parsed.hash ? `${base}?h=${parsed.hash}` : base;
}
