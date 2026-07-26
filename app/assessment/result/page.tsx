import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategoryProseMap } from "@/lib/categories";

const RESULT_CONTENT: Record<
  string,
  {
    headline: string;
    subtext: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel: string;
  }
> = {
  coach_referral: {
    headline: "You deserve real support right now",
    subtext:
      "Based on your answers, you're dealing with something significant and would benefit most from working with a specialist coach. We've matched you with coaches who have helped others through exactly what you're experiencing.",
    ctaLabel: "Connect with a coach →",
    ctaHref: "https://www.betterhelp.com",
    secondaryLabel: "Browse episodes first",
  },
  resource: {
    headline: "You're on the right path — here's what will help",
    subtext:
      "You're at a stage where the right stories, tools, and resources can make a real difference. We've curated episodes and resources specifically for what you're going through.",
    ctaLabel: "Browse matching episodes →",
    ctaHref: "/episodes",
    secondaryLabel: "Explore all resources",
  },
  nurture: {
    headline: "Great — you're already thinking ahead",
    subtext:
      "You're in exploration mode, which is a great place to be. We've put together a selection of episodes that will give you real insights and help you build clarity for what's next.",
    ctaLabel: "Start exploring episodes →",
    ctaHref: "/episodes",
    secondaryLabel: "Browse all episodes",
  },
};

async function getMatchingEpisodes(crisisCategory: string) {
  return prisma.episode.findMany({
    where: {
      publishStatus: "published",
      crisisCategory,
    },
    orderBy: { captivatePublishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      titleOriginal: true,
      titleYoutube: true,
      guestName: true,
      thumbnailUrl: true,
      coverArtUrl: true,
      youtubeThumbnailUrl: true,
      episodeNumber: true,
      durationSeconds: true,
    },
  });
}

async function getAffiliateUrl(
  crisisCategory: string,
  urgency: string
): Promise<string | null> {
  const route = await prisma.affiliateRoute.findFirst({
    where: {
      crisisCategory,
      isActive: true,
      OR: [{ urgencyLevel: urgency }, { urgencyLevel: "any" }],
    },
    orderBy: { priority: "asc" },
  });
  if (route) return route.affiliateUrl;

  const defaultRoute = await prisma.affiliateRoute.findFirst({
    where: { isDefault: true, isActive: true },
    orderBy: { priority: "asc" },
  });
  return defaultRoute?.affiliateUrl ?? null;
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { type?: string; category?: string; urgency?: string };
}) {
  const resultType = searchParams.type ?? "resource";
  const crisisCategory = searchParams.category ?? "career";
  const urgency = searchParams.urgency ?? "exploring";

  const content = RESULT_CONTENT[resultType] ?? RESULT_CONTENT.resource;
  const categoryProseMap = await getCategoryProseMap();
  const categoryLabel = categoryProseMap[crisisCategory] ?? crisisCategory;

  const [episodes, affiliateUrl] = await Promise.all([
    getMatchingEpisodes(crisisCategory),
    getAffiliateUrl(crisisCategory, urgency),
  ]);

  const ctaHref =
    resultType === "coach_referral" && affiliateUrl
      ? affiliateUrl
      : content.ctaHref;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-purple">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">
            Limitless <span className="text-brand-gold">Living</span>
          </Link>
          <span className="text-gray-300 text-sm">Your results</span>
        </div>
      </div>

      {/* Gold progress bar — complete */}
      <div className="h-1 bg-brand-gold" />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Result header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-gold bg-opacity-10 text-brand-gold-dark text-xs font-semibold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
            Your personalised result
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            {content.headline}
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            Based on what you shared about{" "}
            <span className="font-medium text-brand-purple">
              {categoryLabel}
            </span>
            , here&apos;s what we recommend.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            {content.subtext}
          </p>
        </div>

        {/* Primary CTA */}
        <div className="bg-brand-purple rounded-2xl p-6 text-center mb-8">
          <a
            href={ctaHref}
            className="btn-primary w-full block text-center mb-3"
            target={ctaHref.startsWith("http") ? "_blank" : undefined}
            rel={ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {content.ctaLabel}
          </a>
          <Link
            href="/episodes"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {content.secondaryLabel}
          </Link>
        </div>

        {/* Matching episodes */}
        {episodes.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Episodes matched to your situation
            </h2>
            <div className="space-y-3">
              {episodes.map((ep) => {
                const title = ep.titleYoutube ?? ep.titleOriginal;
                const duration = ep.durationSeconds
                  ? `${Math.floor(ep.durationSeconds / 60)} min`
                  : null;
                return (
                  <Link
                    key={ep.id}
                    href={ep.slug ? `/episodes/${ep.slug}` : `/episodes/${ep.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-gold hover:shadow-sm transition-all group"
                  >
                    {(ep.youtubeThumbnailUrl || ep.coverArtUrl || ep.thumbnailUrl) ? (
                      <img
                        src={(ep.youtubeThumbnailUrl || ep.coverArtUrl || ep.thumbnailUrl)!}
                        alt={title}
                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-14 bg-brand-purple rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-gold text-xs font-bold">
                          LLS
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-purple transition-colors">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {ep.guestName && <span>{ep.guestName}</span>}
                        {duration && <span>{duration}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link
                href={`/episodes?category=${crisisCategory}`}
                className="text-sm text-brand-purple font-medium hover:text-brand-gold transition-colors"
              >
                View all {categoryLabel} episodes →
              </Link>
            </div>
          </div>
        )}

        {/* Empty state — no matching episodes yet */}
        {episodes.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-3">
              We&apos;re adding more episodes soon.
            </p>
            <Link
              href="/episodes"
              className="text-sm text-brand-purple font-medium hover:underline"
            >
              Browse all episodes →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
