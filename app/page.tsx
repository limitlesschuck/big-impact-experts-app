import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import HeroOrbit from "@/components/marketing/HeroOrbit";
import DuotoneExpertCard from "@/components/marketing/DuotoneExpertCard";
import SectionHeading from "@/components/marketing/SectionHeading";
import { getHomePageConfig } from "@/lib/getHomePageConfig";
import { getMembershipConfig, interpolatePrice } from "@/lib/siteConfig";
import {
  getUpcomingEventsForHome,
  getFeaturedPanelists,
  getEpisodeCardImagePreference,
  pickEpisodeThumbnail,
} from "@/lib/eventAccess";
import type { CtaTarget } from "@/lib/homePageConfig";
import { jakarta, DISPLAY } from "@/lib/fonts";

export const dynamic = "force-dynamic";

const FEATURED_EXPERTS_LIMIT = 6;
const UPCOMING_EVENTS_LIMIT = 3;

function resolveCtaHref(target: CtaTarget, checkoutUrl: string): string {
  return target === "checkout" ? checkoutUrl : "/membership";
}

function formatEventDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default async function HomePage() {
  const [config, membership, upcomingEvents, thumbnailPreference, experts] = await Promise.all([
    getHomePageConfig(),
    getMembershipConfig(),
    getUpcomingEventsForHome(UPCOMING_EVENTS_LIMIT),
    getEpisodeCardImagePreference(),
    getFeaturedPanelists(FEATURED_EXPERTS_LIMIT),
  ]);

  const price = membership.priceLabel;
  const secondaryHref = resolveCtaHref(config.hero.secondaryCtaTarget, membership.checkoutUrl);
  const becomeMemberHref = resolveCtaHref(config.becomeMember.ctaTarget, membership.checkoutUrl);

  return (
    <div className={`${jakarta.className} bg-white text-brand-ink overflow-x-hidden`}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-[radial-gradient(120%_140%_at_15%_0%,#123A9C_0%,#071A52_55%,#050F38_100%)] text-white py-[clamp(56px,9vw,96px)] px-[clamp(20px,5vw,64px)] pb-[clamp(80px,10vw,120px)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(78,205,196,0.18),transparent_45%)] pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[clamp(40px,6vw,72px)] items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.18] px-4 py-2 rounded-full text-[13px] font-bold tracking-wider uppercase text-brand-teal mb-7">
              {config.hero.eyebrow}
            </div>
            <h1
              className={`${DISPLAY} text-[clamp(38px,5.4vw,68px)] font-extrabold leading-[1.04] tracking-tight mb-6`}
            >
              {config.hero.headline}
            </h1>
            <p className="text-[clamp(17px,1.6vw,19px)] leading-relaxed text-white/80 max-w-lg mb-9">
              {config.hero.subhead}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="bg-brand-orange text-white font-bold text-[17px] px-8 py-[17px] rounded-full shadow-[0_16px_40px_-12px_rgba(242,101,34,0.6)] hover:opacity-90 transition-opacity"
              >
                {config.hero.primaryCtaLabel}
              </Link>
              <a
                href={secondaryHref}
                className="bg-white/[0.08] border border-white/[0.25] text-white font-bold text-[17px] px-8 py-[17px] rounded-full hover:bg-white/[0.15] transition-colors"
              >
                {config.hero.secondaryCtaLabel}
              </a>
            </div>
          </div>

          <HeroOrbit experts={experts} />
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-[clamp(56px,8vw,96px)] px-[clamp(20px,5vw,64px)] bg-white">
          <div className="max-w-[1280px] mx-auto text-center">
            <p className="text-sm font-bold tracking-widest uppercase text-brand-orange mb-10">
              {config.upcomingEvent.heading}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {upcomingEvents.map((event) => {
                const thumbnail = pickEpisodeThumbnail(event, thumbnailPreference);
                return (
                  <Link
                    key={event.id}
                    href="/register"
                    className="block bg-brand-bg border border-brand-ink/[0.08] rounded-[24px] overflow-hidden hover:shadow-lg hover:border-brand-orange/30 transition-all"
                  >
                    <div className="aspect-video bg-brand-ink/5">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={event.titleYoutube ?? event.titleOriginal}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-[clamp(24px,3vw,32px)]">
                      <p className="text-sm text-brand-muted mb-3">
                        {formatEventDate(event.eventDate)}
                      </p>
                      <h2
                        className={`${DISPLAY} text-[clamp(19px,2vw,22px)] font-extrabold tracking-tight text-brand-ink mb-6 line-clamp-2`}
                      >
                        {event.titleYoutube || event.titleOriginal}
                      </h2>
                      <span className="inline-block bg-brand-orange text-white text-sm font-bold px-7 py-3.5 rounded-full">
                        Save My Free Seat
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Meet Our Experts */}
      {experts.length > 0 && (
        <section className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-brand-ink">
          <div className="max-w-[1280px] mx-auto">
            <SectionHeading
              heading={config.expertsTeaser.heading}
              subhead={config.expertsTeaser.subhead}
              light
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {experts.map((p) => (
                <DuotoneExpertCard key={p.id} panelist={p} />
              ))}
            </div>
            <Link
              href="/experts"
              className="inline-flex items-center gap-1.5 text-brand-teal font-semibold hover:underline"
            >
              {config.expertsTeaser.viewAllLabel} →
            </Link>
          </div>
        </section>
      )}

      {/* Become a Member */}
      <section className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-[linear-gradient(160deg,#0944B9,#071A52)] text-white text-center">
        <div className="max-w-[680px] mx-auto">
          <h2
            className={`${DISPLAY} text-[clamp(30px,4vw,44px)] font-extrabold tracking-tight mb-5`}
          >
            {config.becomeMember.heading}
          </h2>
          <p className="text-[17px] text-white/75 leading-relaxed mb-9">
            {interpolatePrice(config.becomeMember.body, price)}
          </p>
          <a
            href={becomeMemberHref}
            className="inline-block bg-brand-orange text-white font-bold text-lg px-10 py-[19px] rounded-full shadow-[0_16px_40px_-12px_rgba(242,101,34,0.55)] hover:opacity-90 transition-opacity"
          >
            {config.becomeMember.ctaLabel}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-[clamp(20px,5vw,64px)] bg-brand-bg border-t border-brand-ink/[0.08] flex justify-between items-center flex-wrap gap-4">
        <div className={`${DISPLAY} font-extrabold text-base text-brand-navy`}>Big Impact Experts</div>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} BigImpactExperts.com ·{" "}
          <Link href="/contact" className="hover:text-brand-navy">
            Contact
          </Link>
        </p>
      </footer>
    </div>
  );
}
