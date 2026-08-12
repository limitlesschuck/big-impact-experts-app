import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PublicExpertCard from "@/components/marketing/PublicExpertCard";
import { getHomePageConfig } from "@/lib/getHomePageConfig";
import { getMembershipConfig, interpolatePrice } from "@/lib/siteConfig";
import { getSoonestUpcomingEvent, getFeaturedPanelists } from "@/lib/eventAccess";
import type { CtaTarget } from "@/lib/homePageConfig";

export const dynamic = "force-dynamic";

const FEATURED_EXPERTS_LIMIT = 6;

function resolveCtaHref(target: CtaTarget, checkoutUrl: string): string {
  return target === "checkout" ? checkoutUrl : "/membership";
}

function formatEventDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default async function HomePage() {
  const [config, membership, event, experts] = await Promise.all([
    getHomePageConfig(),
    getMembershipConfig(),
    getSoonestUpcomingEvent(),
    getFeaturedPanelists(FEATURED_EXPERTS_LIMIT),
  ]);

  const price = membership.priceLabel;
  const heroHref = resolveCtaHref(config.hero.ctaTarget, membership.checkoutUrl);
  const becomeMemberHref = resolveCtaHref(config.becomeMember.ctaTarget, membership.checkoutUrl);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero */}
      <div className="bg-brand-navy">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {config.hero.headline}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            {config.hero.subhead}
          </p>
          <a
            href={heroHref}
            className="inline-block px-10 py-5 bg-brand-orange text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            {config.hero.ctaLabel}
          </a>
        </div>
      </div>

      {/* Upcoming Event */}
      {event && (
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <p className="text-sm font-semibold text-brand-teal tracking-widest uppercase text-center mb-6">
            {config.upcomingEvent.heading}
          </p>
          <Link
            href="/register"
            className="block bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500 mb-2">{formatEventDate(event.eventDate)}</p>
            <h2 className="text-2xl font-bold text-brand-navy mb-4">
              {event.titleYoutube || event.titleOriginal}
            </h2>
            <span className="inline-block px-6 py-3 bg-brand-orange text-white text-sm font-bold rounded-lg">
              Save My Free Seat
            </span>
          </Link>
        </div>
      )}

      {/* Meet Our Experts */}
      {experts.length > 0 && (
        <div className="bg-brand-bg">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
                {config.expertsTeaser.heading}
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                {config.expertsTeaser.subhead}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {experts.map((p) => (
                <PublicExpertCard key={p.id} panelist={p} />
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/experts"
                className="inline-block text-brand-orange font-semibold hover:underline"
              >
                {config.expertsTeaser.viewAllLabel} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Become a Member */}
      <div className="bg-brand-navy">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {config.becomeMember.heading}
          </h2>
          <p className="text-lg text-white/70 mb-10">
            {interpolatePrice(config.becomeMember.body, price)}
          </p>
          <a
            href={becomeMemberHref}
            className="inline-block px-10 py-5 bg-brand-orange text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            {config.becomeMember.ctaLabel}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 border-t border-gray-100">
        <p className="text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} BigImpactExperts.com ·{" "}
          <Link href="/contact" className="hover:text-gray-600">
            Contact
          </Link>
        </p>
      </div>
    </div>
  );
}
