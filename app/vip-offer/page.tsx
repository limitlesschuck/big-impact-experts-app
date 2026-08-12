import Link from "next/link";
import { getVipOfferConfig } from "@/lib/getVipOfferConfig";
import { getMembershipConfig, interpolatePrice } from "@/lib/siteConfig";
import { safeSurveyUrl } from "@/lib/safeUrl";
import { jakarta, DISPLAY } from "@/lib/fonts";

export const dynamic = "force-dynamic";

// No SiteHeader here, deliberately -- same convention as /confirmation:
// a focused, single-decision funnel page shouldn't offer a nav full of
// competing links (least of all "Become a Member" at the regular price,
// right next to this page's discounted offer).
export default async function VipOfferPage({
  searchParams,
}: {
  searchParams: { survey?: string | string[] };
}) {
  const [config, membership] = await Promise.all([getVipOfferConfig(), getMembershipConfig()]);

  const price = membership.vipOfferPrice;
  const surveyUrl = safeSurveyUrl(searchParams.survey);
  const confirmationUrl = surveyUrl
    ? `/confirmation?survey=${encodeURIComponent(surveyUrl)}`
    : "/confirmation";

  return (
    <div className={`${jakarta.className} bg-white text-brand-ink overflow-x-hidden`}>
      {/* Hero */}
      <section className="relative bg-[radial-gradient(120%_140%_at_15%_0%,#123A9C_0%,#071A52_55%,#050F38_100%)] text-white py-[clamp(56px,9vw,88px)] px-[clamp(20px,5vw,64px)] text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(78,205,196,0.18),transparent_45%)] pointer-events-none" />
        <div className="relative max-w-[720px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.18] px-4 py-2 rounded-full text-[13px] font-bold tracking-wider uppercase text-brand-teal mb-7">
            {config.hero.eyebrow}
          </div>
          <h1
            className={`${DISPLAY} text-[clamp(32px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-tight mb-6`}
          >
            {config.hero.headline}
          </h1>
          <p className="text-[clamp(17px,1.6vw,19px)] leading-relaxed text-white/80">
            {interpolatePrice(config.hero.subhead, price)}
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-[clamp(48px,7vw,80px)] px-[clamp(20px,5vw,64px)] bg-white text-center">
        <div className="max-w-[640px] mx-auto">
          <h2
            className={`${DISPLAY} text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight mb-4`}
          >
            {config.offerSection.heading}
          </h2>
          <p className="text-[17px] leading-relaxed text-brand-muted">
            {interpolatePrice(config.offerSection.body, price)}
          </p>
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-[clamp(48px,7vw,80px)] px-[clamp(20px,5vw,64px)] bg-brand-bg">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {config.bonuses.map((bonus, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-brand-ink/[0.08] p-7">
              <div className="text-xs font-bold tracking-wider uppercase text-brand-orange mb-3">
                Bonus {i + 1}
              </div>
              <h3 className={`${DISPLAY} text-lg font-bold tracking-tight mb-2`}>{bonus.title}</h3>
              <p className="text-[15px] text-brand-muted leading-relaxed mb-4">
                {bonus.description}
              </p>
              <div className={`${DISPLAY} text-brand-navy font-extrabold`}>{bonus.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-[clamp(56px,8vw,96px)] px-[clamp(20px,5vw,64px)] bg-[linear-gradient(160deg,#0944B9,#071A52)] text-white text-center">
        <div className="max-w-[560px] mx-auto">
          <a
            href={membership.vipOfferCheckoutUrl}
            className="inline-block bg-brand-orange text-white font-bold text-lg px-10 py-[19px] rounded-full shadow-[0_16px_40px_-12px_rgba(242,101,34,0.55)] hover:opacity-90 transition-opacity"
          >
            {interpolatePrice(config.finalCta.label, price)}
          </a>
          <p className="text-sm text-white/60 mt-5">{config.finalCta.subtext}</p>
          <Link
            href={confirmationUrl}
            className="inline-block text-sm text-white/50 hover:text-white/80 underline mt-8 transition-colors"
          >
            {config.declineLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
