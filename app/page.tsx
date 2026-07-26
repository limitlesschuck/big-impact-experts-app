import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import HeroPhoto from "@/components/HeroPhoto";
import { getCategoryOptions } from "@/lib/categories";

export const dynamic = 'force-dynamic';

async function getCategoryLabels() {
  const categories = await getCategoryOptions();
  return Object.fromEntries(categories.map((c) => [c.value, c.label]));
}

const PLATFORMS = [
  {
    name: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/the-limitless-living-show/id1751543846",
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/show/78eDxPL98YSRZQP80n8rLC",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@limitlesslivingpodcast",
  },
];

async function getSiteConfig(): Promise<{ episodeCardImage: "youtube_thumbnail" | "cover_art" }> {
  try {
    const record = await prisma.siteConfig.findFirst();
    const config = record?.config as { episodeCardImage?: string } | null;
    return {
      episodeCardImage: (config?.episodeCardImage as "youtube_thumbnail" | "cover_art") ?? "youtube_thumbnail",
    };
  } catch {
    return { episodeCardImage: "youtube_thumbnail" };
  }
}

async function getHomeData() {
  const [latest, featured] = await Promise.all([
    prisma.episode.findMany({
      where: { publishStatus: "published" },
      orderBy: { captivatePublishedAt: "desc" },
      take: 7,
      select: {
        id: true,
        titleOriginal: true,
        titleYoutube: true,
        descriptionWebsite: true,
        guestName: true,
        crisisCategory: true,
        slug: true,
        thumbnailUrl: true,
        coverArtUrl: true,
        youtubeThumbnailUrl: true,
        youtubeId: true,
        episodeNumber: true,
        durationSeconds: true,
        captivatePublishedAt: true,
      },
    }),
    prisma.episode.findMany({
      where: { publishStatus: "published", youtubeId: { not: null } },
      orderBy: { captivatePublishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        titleOriginal: true,
        titleYoutube: true,
        descriptionWebsite: true,
        guestName: true,
        crisisCategory: true,
        slug: true,
        thumbnailUrl: true,
        coverArtUrl: true,
        youtubeThumbnailUrl: true,
        youtubeId: true,
        episodeNumber: true,
        durationSeconds: true,
        captivatePublishedAt: true,
      },
    }),
  ]);

  return { latest, featured };
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

function EpisodeCard({
  episode,
  large = false,
  imageMode = "youtube_thumbnail",
  categoryLabels,
}: {
  episode: {
    id: string;
    slug: string | null;
    titleOriginal: string;
    titleYoutube: string | null;
    descriptionWebsite: string | null;
    guestName: string | null;
    crisisCategory: string | null;
    thumbnailUrl: string | null;
    coverArtUrl: string | null;
    youtubeThumbnailUrl: string | null;
    episodeNumber: number | null;
    durationSeconds: number | null;
    captivatePublishedAt: Date | null | string;
  };
  large?: boolean;
  imageMode?: "youtube_thumbnail" | "cover_art";
  categoryLabels: Record<string, string>;
}) {
  const title = episode.titleYoutube ?? episode.titleOriginal;
  const episodeHref = episode.slug
    ? `/episodes/${episode.slug}`
    : `/episodes/${episode.id}`;
  const category = episode.crisisCategory
    ? categoryLabels[episode.crisisCategory]
    : null;
  const duration = formatDuration(episode.durationSeconds);
  const displayImage = large
    ? episode.coverArtUrl || episode.thumbnailUrl
    : imageMode === "cover_art"
    ? episode.coverArtUrl || episode.thumbnailUrl
    : episode.youtubeThumbnailUrl || episode.coverArtUrl || episode.thumbnailUrl;

  const imageClass = imageMode === "cover_art"
    ? "w-full h-full object-contain bg-brand-purple"
    : "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300";

  if (large) {
    return (
      <Link href={episodeHref} className="group block">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-brand-gold transition-all duration-200">
          <div className="relative aspect-video md:aspect-auto bg-brand-purple-dark overflow-hidden">
            {displayImage ? (
              <img
                src={displayImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-purple">
                <span className="text-brand-gold text-4xl font-bold">LLS</span>
              </div>
            )}
          </div>
          <div className="p-8 flex flex-col justify-center">
            {category && (
              <span className="inline-block text-xs font-semibold text-brand-gold uppercase tracking-wider mb-3">
                {category}
              </span>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors leading-tight">
              {title}
            </h2>
            {episode.guestName && (
              <p className="text-sm text-gray-500 mb-3">
                with {episode.guestName}
              </p>
            )}
            {episode.descriptionWebsite && (
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {episode.descriptionWebsite}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {episode.episodeNumber && (
                <span>Ep. {episode.episodeNumber}</span>
              )}
              {duration && <span>{duration}</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={episodeHref} className="episode-card group block">
      <div className={`relative bg-brand-purple-dark overflow-hidden ${imageMode === "cover_art" ? "aspect-square" : "aspect-video"}`}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={title}
            className={imageClass}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-purple">
            <span className="text-brand-gold text-2xl font-bold">LLS</span>
          </div>
        )}
        {category && (
          <span className="absolute top-2 left-2 text-xs font-semibold bg-brand-gold text-brand-purple-dark px-2 py-0.5 rounded-full">
            {category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-purple transition-colors">
          {title}
        </h3>
        {episode.guestName && (
          <p className="text-xs text-gray-500">with {episode.guestName}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          {episode.episodeNumber && <span>Ep. {episode.episodeNumber}</span>}
          {duration && <span>{duration}</span>}
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const { latest, featured } = await getHomeData();
  const [siteConfig, categoryLabels] = await Promise.all([
    getSiteConfig(),
    getCategoryLabels(),
  ]);
  const heroEpisode = featured[0] ?? latest[0] ?? null;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero section */}
      <section className="bg-brand-purple relative overflow-hidden min-h-[560px]">
        <div className="absolute inset-0 bg-brand-purple-dark opacity-40" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            {/* Left — text content */}
            <div>
              <p className="text-brand-gold text-sm font-semibold uppercase tracking-widest mb-4">
                The Limitless Living Show with Chuck Anderson
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                Real stories of transformation and overcoming limits
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Conversations with coaches, authors, and speakers who rebuilt
                their lives from the inside out.
              </p>

              {/* Assessment CTA box */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
                <p className="text-brand-purple font-bold text-lg mb-1">
                  Going through a difficult time?
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Take our free 2-minute assessment and find your path forward.
                </p>
                <Link href="/assessment" className="btn-primary w-full text-center block">
                  Take the free assessment →
                </Link>
              </div>

              {/* Platform links */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-gray-400">Listen on</span>
                {PLATFORMS.map((p) => (
                  <a
                    key={p.name}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-white border-2 border-white border-opacity-40 px-4 py-2 rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors"
                  >
                    {p.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Right — Chuck's photo */}
            <HeroPhoto />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Featured episode */}
        {heroEpisode && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Latest episode
              </h2>
            </div>
            <EpisodeCard episode={heroEpisode} large categoryLabels={categoryLabels} />
          </section>
        )}

        {/* Recent episodes grid */}
        {latest.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent episodes
              </h2>
              <Link
                href="/episodes"
                className="text-sm text-brand-purple font-medium hover:text-brand-gold transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.slice(1, 7).map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} imageMode={siteConfig.episodeCardImage} categoryLabels={categoryLabels} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/episodes"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-brand-purple border-2 border-brand-purple rounded-full hover:bg-brand-purple hover:text-white transition-colors"
              >
                View all episodes →
              </Link>
            </div>
          </section>
        )}

        {/* Empty state */}
        {latest.length === 0 && (
          <section className="text-center py-24">
            <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-gold text-2xl font-bold">LLS</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Episodes coming soon
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Subscribe to get notified when new episodes drop.
            </p>
            <Link href="/assessment" className="btn-primary">
              Take the free assessment
            </Link>
          </section>
        )}

        {/* Assessment CTA banner */}
        <section className="bg-brand-purple rounded-2xl p-8 sm:p-12 text-center">
          <p className="text-brand-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Free resource
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Not sure where to start?
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Answer 4 quick questions and we&apos;ll match you with the right
            episodes, resources, and support for exactly what you&apos;re going
            through.
          </p>
          <Link href="/assessment" className="btn-primary">
            Find your path forward →
          </Link>
        </section>
      </div>

      <footer className="bg-brand-purple-dark border-t border-brand-purple mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Limitless Living Show with Chuck Anderson
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/episodes" className="text-xs text-gray-400 hover:text-white transition-colors">
              Episodes
            </Link>
            <Link href="/assessment" className="text-xs text-gray-400 hover:text-white transition-colors">
              Assessment
            </Link>
            <a href="https://podcasts.apple.com/us/podcast/the-limitless-living-show/id1751543846" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">
              Apple Podcasts
            </a>
            <a href="https://open.spotify.com/show/78eDxPL98YSRZQP80n8rLC" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">
              Spotify
            </a>
            <a href="https://www.youtube.com/@limitlesslivingpodcast" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
