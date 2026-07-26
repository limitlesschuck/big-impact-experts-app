import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import GuideDownloadModal from "@/components/GuideDownloadModal";
import { getCategoryOptions } from "@/lib/categories";

export const dynamic = 'force-dynamic';

async function getCategoryLabels() {
  const categories = await getCategoryOptions();
  return Object.fromEntries(categories.map((c) => [c.value, c.label]));
}

async function getEpisode(idOrSlug: string) {
  return prisma.episode.findFirst({
    where: {
      publishStatus: "published",
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: { cta: true },
  });
}

async function getSiteConfig() {
  const record = await prisma.siteConfig.findFirst();
  const cfg = record?.config as Record<string, unknown> | null;
  return {
    episodeGuideEnabled: cfg?.episodeGuideEnabled === true,
  };
}

export default async function EpisodeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [episode, siteConfig, categoryLabelsMap] = await Promise.all([
    getEpisode(params.id),
    getSiteConfig(),
    getCategoryLabels(),
  ]);
  if (!episode) notFound();

  if (episode.slug && params.id !== episode.slug) {
    redirect(`/episodes/${episode.slug}`);
  }

  const title = episode.titleYoutube ?? episode.titleOriginal;
  const category = episode.crisisCategory
    ? categoryLabelsMap[episode.crisisCategory]
    : null;
  const ctaHeadline = episode.cta?.headline
    ?? "Ready to start your transformation?";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand-purple transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/episodes"
            className="hover:text-brand-purple transition-colors"
          >
            Episodes
          </Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{title}</span>
        </div>

        {/* Episode header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {episode.episodeNumber && (
              <span className="text-xs font-semibold text-gray-400">
                Episode {episode.episodeNumber}
              </span>
            )}
            {category && (
              <span className="text-xs font-semibold bg-brand-gold text-brand-purple-dark px-3 py-1 rounded-full">
                {category}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {title}
          </h1>
          {episode.guestName && (
            <p className="text-lg text-gray-500">
              with{" "}
              <span className="font-medium text-gray-700">
                {episode.guestName}
              </span>
            </p>
          )}
        </div>

        {/* YouTube embed or thumbnail */}
        {episode.youtubeId ? (
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${episode.youtubeId}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (episode.youtubeThumbnailUrl || episode.coverArtUrl || episode.thumbnailUrl) ? (
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 bg-brand-purple-dark">
            <img
              src={(episode.youtubeThumbnailUrl || episode.coverArtUrl || episode.thumbnailUrl)!}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* Captivate embedded player */}
        {episode.captivateId && (
          <div className="mb-8" style={{ width: "100%", height: "200px", borderRadius: "6px", overflow: "hidden" }}>
            <iframe
              style={{ width: "100%", height: "200px" }}
              frameBorder="no"
              scrolling="no"
              allow="clipboard-write"
              src={`https://player.captivate.fm/episode/${episode.captivateId}/`}
            />
          </div>
        )}

        {/* Assessment CTA */}
        <div className="bg-brand-purple rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-white font-bold text-lg mb-1">{ctaHeadline}</p>
            <p className="text-gray-300 text-sm">
              Take our free assessment and find your path forward.
            </p>
          </div>
          <Link
            href="/assessment"
            className="btn-primary whitespace-nowrap shrink-0"
          >
            Take the assessment →
          </Link>
        </div>

        {/* Show notes */}
        {(episode.descriptionWebsite ?? episode.descriptionOriginal) && (
          <div className="prose prose-gray max-w-none mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              About this episode
            </h2>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {episode.descriptionWebsite ?? episode.descriptionOriginal}
            </div>
          </div>
        )}

        {/* Guest bio */}
        {episode.guestBio && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              About {episode.guestName ?? "the guest"}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {episode.guestBio}
            </p>
          </div>
        )}


        {/* Episode Guide Download */}
        {siteConfig.episodeGuideEnabled && episode.guidePdfUrl && (
          <div className="bg-brand-gold/10 border border-brand-gold rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-extrabold text-brand-purple-dark mb-1">
              📄 Free Episode Guide
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Get the key takeaways, frameworks, and action items from this episode as a free PDF guide.
            </p>
            <GuideDownloadModal
              episodeId={episode.id}
              episodeTitle={episode.titleYoutube ?? episode.titleOriginal}
            />
          </div>
        )}

        {/* Bottom CTA */}
        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Enjoyed this episode?{" "}
            <Link
              href="/episodes"
              className="text-brand-purple font-medium hover:underline"
            >
              Browse all episodes →
            </Link>
          </p>
        </div>
      </div>

      <footer className="bg-brand-purple-dark border-t border-brand-purple mt-8">
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
