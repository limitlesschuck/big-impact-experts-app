import Parser from "rss-parser";

const RSS_FEED_URL = "https://feeds.captivate.fm/limitlessliving/";

export interface CaptivateEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
  episodeNumber: number | null;
  season: number | null;
  link: string | null;
}

type CustomItem = {
  guid: string;
  title: string;
  contentSnippet?: string;
  content?: string;
  enclosure?: { url: string };
  itunes?: {
    image?: string;
    duration?: string;
    episode?: string;
    season?: string;
  };
  pubDate?: string;
  link?: string;
};

function parseDurationToSeconds(duration: string | undefined): number | null {
  if (!duration) return null;
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return null;
}

function extractGuestName(title: string): string | null {
  const withMatch = title.match(
    /\bwith\s+([A-Z][a-z]+(?:\s+[A-Z][a-z\-]+)*)\s*$/i
  );
  if (withMatch) return withMatch[1];
  return null;
}

export async function fetchCaptivateEpisodes(): Promise<CaptivateEpisode[]> {
  const parser = new Parser<Record<string, unknown>, CustomItem>({
    customFields: {
      item: [
        ["itunes:image", "itunes.image"],
        ["itunes:duration", "itunes.duration"],
        ["itunes:episode", "itunes.episode"],
        ["itunes:season", "itunes.season"],
      ],
    },
  });

  const feed = await parser.parseURL(RSS_FEED_URL);

  return feed.items.map((item) => ({
    id: item.guid ?? item.link ?? item.title ?? "",
    title: item.title ?? "Untitled",
    description: item.contentSnippet ?? item.content ?? "",
    audioUrl: item.enclosure?.url ?? "",
    thumbnailUrl: item.itunes?.image ?? null,
    durationSeconds: parseDurationToSeconds(item.itunes?.duration),
    publishedAt: item.pubDate ?? null,
    episodeNumber: item.itunes?.episode ? parseInt(item.itunes.episode) : null,
    season: item.itunes?.season ? parseInt(item.itunes.season) : null,
    link: item.link ?? null,
  }));
}

export { extractGuestName };
