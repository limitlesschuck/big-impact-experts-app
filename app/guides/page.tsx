import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import GuideDownloadModal from "@/components/GuideDownloadModal";

export const dynamic = "force-dynamic";

async function getEpisodesWithGuides() {
  return prisma.episode.findMany({
    where: {
      publishStatus: "published",
      guidePdfUrl: { not: null },
    },
    orderBy: { captivatePublishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      episodeNumber: true,
      titleOriginal: true,
      titleYoutube: true,
      guestName: true,
      thumbnailUrl: true,
      coverArtUrl: true,
      youtubeThumbnailUrl: true,
      guidePdfUrl: true,
    },
  });
}

async function getSiteConfig(): Promise<{ episodeGuideEnabled: boolean }> {
  const record = await prisma.siteConfig.findFirst();
  const cfg = record?.config as Record<string, unknown> | null;
  return { episodeGuideEnabled: cfg?.episodeGuideEnabled === true };
}

export default async function GuidesPage() {
  const [siteConfig, episodes] = await Promise.all([
    getSiteConfig(),
    getEpisodesWithGuides(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="bg-brand-purple py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Free episode guides
          </h1>
          <p className="text-gray-300 text-sm">
            Key takeaways, frameworks, and action items from every episode —
            delivered straight to your inbox.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {!siteConfig.episodeGuideEnabled || episodes.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-sm mb-4">
              No guides are available yet — check back soon.
            </p>
            <Link
              href="/episodes"
              className="text-sm text-brand-purple font-medium hover:underline"
            >
              Browse all episodes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((ep) => {
              const title = ep.titleYoutube ?? ep.titleOriginal;
              const displayImage =
                ep.youtubeThumbnailUrl || ep.coverArtUrl || ep.thumbnailUrl;
              const href = ep.slug ? `/episodes/${ep.slug}` : `/episodes/${ep.id}`;

              return (
                <div
                  key={ep.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
                >
                  <Link href={href} className="group block">
                    <div className="relative bg-brand-purple-dark overflow-hidden aspect-video">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-purple">
                          <span className="text-brand-gold text-2xl font-bold">
                            LLS
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <Link href={href} className="group">
                      <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-purple transition-colors">
                        {title}
                      </h2>
                    </Link>
                    {ep.guestName && (
                      <p className="text-xs text-gray-500 mb-4">
                        with {ep.guestName}
                      </p>
                    )}

                    <div className="mt-auto">
                      <GuideDownloadModal
                        episodeId={ep.id}
                        episodeTitle={title}
                      />
                    </div>
                  </div>
                </div>
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
            <Link href="/guides" className="text-xs text-gray-400 hover:text-white transition-colors">Guides</Link>
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
