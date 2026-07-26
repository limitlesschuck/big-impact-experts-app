import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getCategoryOptions } from "@/lib/categories";

export const dynamic = 'force-dynamic';

async function getCategoryLabels() {
  const categories = await getCategoryOptions();
  return Object.fromEntries(categories.map((c) => [c.value, c.label]));
}

async function getEpisodes(category?: string) {
  return prisma.episode.findMany({
    where: {
      publishStatus: "published",
      ...(category ? { crisisCategory: category } : {}),
    },
    orderBy: { captivatePublishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      episodeNumber: true,
      titleOriginal: true,
      titleYoutube: true,
      descriptionWebsite: true,
      guestName: true,
      crisisCategory: true,
      thumbnailUrl: true,
      coverArtUrl: true,
      youtubeThumbnailUrl: true,
      youtubeId: true,
      durationSeconds: true,
      captivatePublishedAt: true,
    },
  });
}

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

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  return `${Math.floor(seconds / 60)} min`;
}

export default async function EpisodesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;
  const [siteConfig, episodes, categoryLabelsMap, categories] = await Promise.all([
    getSiteConfig(),
    getEpisodes(category),
    getCategoryLabels(),
    getCategoryOptions(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="bg-brand-purple py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            All episodes
          </h1>
          <p className="text-gray-300 text-sm">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
            {category ? ` in ${categoryLabelsMap[category] ?? category}` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <Link
            href="/episodes"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category
                ? "bg-brand-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.value}
              href={`/episodes?category=${c.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === c.value
                  ? "bg-brand-purple text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-sm mb-4">
              No episodes found in this category yet.
            </p>
            <Link
              href="/episodes"
              className="text-sm text-brand-purple font-medium hover:underline"
            >
              View all episodes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((ep) => {
              const title = ep.titleYoutube ?? ep.titleOriginal;
              const epCategory = ep.crisisCategory
                ? categoryLabelsMap[ep.crisisCategory]
                : null;
              const duration = formatDuration(ep.durationSeconds);
              const displayImage =
                siteConfig.episodeCardImage === "cover_art"
                  ? ep.coverArtUrl || ep.thumbnailUrl
                  : ep.youtubeThumbnailUrl || ep.coverArtUrl || ep.thumbnailUrl;

              return (
                <Link
                  key={ep.id}
                  href={ep.slug ? `/episodes/${ep.slug}` : `/episodes/${ep.id}`}
                  className="group episode-card block"
                >
                  <div className={`relative bg-brand-purple-dark overflow-hidden ${siteConfig.episodeCardImage === "cover_art" ? "aspect-square" : "aspect-video"}`}>
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={title}
                        className={`w-full h-full ${siteConfig.episodeCardImage === "cover_art" ? "object-contain" : "object-cover group-hover:scale-105 transition-transform duration-300"}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-purple">
                        <span className="text-brand-gold text-2xl font-bold">
                          LLS
                        </span>
                      </div>
                    )}
                    {epCategory && (
                      <span className="absolute top-2 left-2 text-xs font-semibold bg-brand-gold text-brand-purple-dark px-2 py-0.5 rounded-full">
                        {epCategory}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-purple transition-colors">
                      {title}
                    </h2>
                    {ep.guestName && (
                      <p className="text-xs text-gray-500">
                        with {ep.guestName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      {ep.episodeNumber && (
                        <span>Ep. {ep.episodeNumber}</span>
                      )}
                      {duration && <span>{duration}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Assessment CTA */}
        <div className="mt-16 bg-brand-purple rounded-2xl p-8 text-center">
          <p className="text-brand-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Not sure where to start?
          </p>
          <h2 className="text-2xl font-bold text-white mb-3">
            Find the episodes that are right for you
          </h2>
          <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
            Answer 4 quick questions and we&apos;ll match you with the right
            episodes and resources for exactly what you&apos;re going through.
          </p>
          <Link href="/assessment" className="btn-primary">
            Take the free assessment →
          </Link>
        </div>
      </div>

      <footer className="bg-brand-purple-dark border-t border-brand-purple mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Limitless Living Show with Chuck Anderson
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/episodes" className="text-xs text-gray-400 hover:text-white transition-colors">Episodes</Link>
            <Link href="/assessment" className="text-xs text-gray-400 hover:text-white transition-colors">Assessment</Link>
            <a href="https://podcasts.apple.com/us/podcast/the-limitless-living-show/id1751543846" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Apple Podcasts</a>
            <a href="https://open.spotify.com/show/78eDxPL98YSRZQP80n8rLC" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Spotify</a>
            <a href="https://www.youtube.com/@limitlesslivingpodcast" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
