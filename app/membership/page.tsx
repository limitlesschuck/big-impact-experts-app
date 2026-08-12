import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import HeroOrbit from "@/components/marketing/HeroOrbit";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import Eyebrow from "@/components/marketing/Eyebrow";
import SectionHeading from "@/components/marketing/SectionHeading";
import DuotoneExpertCard from "@/components/marketing/DuotoneExpertCard";
import {
  EyeIcon,
  MicIcon,
  TargetIcon,
  PartnershipIcon,
  StoryIcon,
  CalendarCheckIcon,
  ChecklistIcon,
  PlayCircleIcon,
  NetworkIcon,
  CheckBadgeIcon,
} from "@/components/marketing/SalesPageIcons";
import { getSalesPageConfig } from "@/lib/getSalesPageConfig";
import { getMembershipConfig, interpolatePrice } from "@/lib/siteConfig";
import { getFeaturedPanelists } from "@/lib/eventAccess";
import { jakarta, DISPLAY } from "@/lib/fonts";

export const dynamic = "force-dynamic";

const FEATURED_EXPERTS_LIMIT = 9;
const ORBIT_EXPERTS_LIMIT = 6;

const ENHANCE_ICONS = [EyeIcon, MicIcon, TargetIcon, PartnershipIcon, StoryIcon];
const HOW_IT_WORKS_ICONS = [CalendarCheckIcon, ChecklistIcon, PlayCircleIcon, NetworkIcon];


export default async function MembershipPage() {
  const [config, membership, allExperts] = await Promise.all([
    getSalesPageConfig(),
    getMembershipConfig(),
    getFeaturedPanelists(FEATURED_EXPERTS_LIMIT),
  ]);

  const price = membership.priceLabel;
  const checkoutUrl = membership.checkoutUrl;
  const orbitExperts = allExperts.slice(0, ORBIT_EXPERTS_LIMIT);
  const whatIsParagraphs = config.whatIsSection.body.split(/\n\s*\n/).filter(Boolean);

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
            <div className="flex items-center gap-5 flex-wrap">
              <a
                href={checkoutUrl}
                className="bg-brand-orange text-white font-bold text-[17px] px-8 py-[17px] rounded-full shadow-[0_16px_40px_-12px_rgba(242,101,34,0.6)] hover:opacity-90 transition-opacity"
              >
                {config.hero.ctaLabel}
              </a>
              <span className="text-sm text-white/55">{config.hero.supportingLine}</span>
            </div>
          </div>

          <HeroOrbit experts={orbitExperts} />
        </div>
      </section>

      {/* 1. What Is Big Impact Experts? */}
      <section className="py-[clamp(64px,9vw,112px)] px-[clamp(20px,5vw,64px)] bg-white">
        <div className="max-w-[960px] mx-auto">
          <Eyebrow>What Is Big Impact Experts</Eyebrow>
          {whatIsParagraphs.map((para, i) =>
            i === 0 ? (
              <p
                key={i}
                className={`${DISPLAY} text-[clamp(24px,2.6vw,32px)] leading-[1.45] font-semibold tracking-tight text-brand-ink mb-7`}
              >
                {para}
              </p>
            ) : (
              <p key={i} className="text-lg leading-[1.75] text-brand-muted">
                {para}
              </p>
            )
          )}
        </div>
      </section>

      {/* 2. Enhance Every Area of Your Business */}
      <section className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <h2 className={`${DISPLAY} text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-3`}>
            {config.enhanceSection.heading}
          </h2>
          <p className="text-[17px] text-brand-muted mb-11 max-w-xl">{config.enhanceSection.subhead}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {config.enhanceSection.bullets.map((bullet, i) => {
              const Icon = ENHANCE_ICONS[i % ENHANCE_ICONS.length];
              return (
                <div key={i} className="p-7 rounded-[20px] bg-brand-bg">
                  <div className="w-[52px] h-[52px] rounded-full bg-brand-navy text-white flex items-center justify-center mb-5">
                    <Icon />
                  </div>
                  <h3 className="text-[19px] font-bold mb-2">{bullet.title}</h3>
                  <p className="text-[15px] leading-relaxed text-brand-muted">{bullet.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. How Our Program Works */}
      <section id="how-it-works" className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-brand-bg">
        <div className="max-w-[1200px] mx-auto">
          <h2
            className={`${DISPLAY} text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-11`}
          >
            {config.howItWorks.heading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-ink/[0.08] rounded-[20px] overflow-hidden">
            {config.howItWorks.items.map((item, i) => {
              const Icon = HOW_IT_WORKS_ICONS[i % HOW_IT_WORKS_ICONS.length];
              return (
                <div key={i} className="p-8 bg-white">
                  <div className={`${DISPLAY} text-sm font-extrabold text-brand-orange mb-4`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="w-11 h-11 rounded-[10px] border-2 border-brand-navy text-brand-navy flex items-center justify-center mb-4">
                    <Icon />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed text-brand-muted">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Learn From The Best Experts */}
      {allExperts.length > 0 && (
        <section id="experts" className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-brand-ink">
          <div className="max-w-[1280px] mx-auto">
            <SectionHeading
              heading={config.expertsSection.heading}
              subhead={config.expertsSection.intro}
              light
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allExperts.map((p) => (
                <DuotoneExpertCard key={p.id} panelist={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Explore Topics Like */}
      <section className="py-[clamp(56px,8vw,96px)] px-[clamp(20px,5vw,64px)] bg-white text-center">
        <div className="max-w-[900px] mx-auto">
          <h2 className={`${DISPLAY} text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-3.5`}>
            {config.topicsSection.heading}
          </h2>
          <p className="text-[17px] text-brand-muted mb-9">{config.topicsSection.body}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {config.topicsSection.topics.map((topic, i) => (
              <span
                key={i}
                className="px-[18px] py-2.5 rounded-full border-[1.5px] border-brand-navy/[0.18] text-sm font-semibold text-brand-navy bg-brand-bg"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6. What You Get + Program Value */}
      <section className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-brand-bg">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div>
            <h2
              className={`${DISPLAY} text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-9`}
            >
              {config.whatYouGet.heading}
            </h2>
            <div className="flex flex-col">
              {config.whatYouGet.items.map((item, i) => (
                <div key={i} className="py-5 border-b border-brand-ink/10 font-bold text-[17px]">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[24px] p-[clamp(32px,4vw,48px)] text-white bg-[linear-gradient(160deg,#0944B9,#071A52)]">
            <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,#F26522,transparent_70%)] opacity-60" />
            <div className="relative">
              <div className="text-sm font-bold tracking-wider uppercase text-brand-teal mb-3.5">
                {config.programValue.heading}
              </div>
              <p className={`${DISPLAY} text-[clamp(28px,3.6vw,38px)] font-extrabold leading-snug mb-7`}>
                {config.programValue.body}
              </p>
              <div className="flex items-baseline gap-2.5 mb-7">
                <span className="text-[15px] text-white/60">Your price:</span>
                <span className={`${DISPLAY} text-[28px] font-extrabold`}>
                  {price}
                </span>
              </div>
              <a
                href={checkoutUrl}
                className="inline-block bg-brand-orange text-white font-bold text-base px-7 py-[15px] rounded-full hover:opacity-90 transition-opacity"
              >
                {interpolatePrice(config.finalCta.label, price)}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Advanced AI Expert Match */}
      <section className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-teal/[0.12] px-4 py-2 rounded-full text-[13px] font-bold tracking-wider uppercase text-[#0e8f85] mb-5">
              {config.aiExpertMatch.heading}
            </div>
            <h2
              className={`${DISPLAY} text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-5`}
            >
              Not sure who can help? Just ask.
            </h2>
            <p className="text-[17px] leading-[1.7] text-brand-muted mb-7">{config.aiExpertMatch.body}</p>
            <div className="flex flex-wrap gap-2.5">
              {config.aiExpertMatch.challenges.map((challenge, i) => (
                <a
                  key={i}
                  href={checkoutUrl}
                  className="px-4 py-2.5 rounded-full text-sm font-semibold border-[1.5px] border-brand-navy/20 text-brand-navy bg-white hover:bg-brand-navy hover:text-white transition-colors"
                >
                  {challenge}
                </a>
              ))}
            </div>
          </div>
          <div className="bg-brand-bg rounded-[24px] p-[clamp(28px,3vw,36px)] border border-brand-ink/[0.08]">
            <div className="text-[13px] font-bold tracking-wider uppercase text-gray-400 mb-3.5">
              Members-Only
            </div>
            <p className="text-[15px] leading-[1.7] text-brand-muted">
              Once you&rsquo;re a member, describe your challenge from your dashboard and AI
              Expert Match instantly surfaces the expert whose approach fits — grounded in real
              guide content from every panel, not a generic chatbot.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-brand-bg">
        <div className="max-w-[1280px] mx-auto">
          <h2
            className={`${DISPLAY} text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-3`}
          >
            Real Members. Real Results.
          </h2>
          <p className="text-[17px] text-brand-muted mb-11 max-w-xl">
            Hear from coaches and consultants who&rsquo;ve put these frameworks to work.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {config.testimonials.map((t, i) => (
              <video
                key={i}
                src={t.videoUrl}
                controls
                className="w-full aspect-[9/16] rounded-2xl bg-brand-ink object-cover border border-brand-ink/[0.08]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Getting Started Is Easy */}
      <section className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <h2
            className={`${DISPLAY} text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-11`}
          >
            {config.gettingStarted.heading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.gettingStarted.steps.map((step, i) => (
              <div key={i}>
                <div className={`${DISPLAY} text-[32px] font-extrabold text-brand-navy/[0.18] mb-3`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-brand-muted">
                  {interpolatePrice(step.description, price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Guarantee */}
      <section className="py-[clamp(56px,8vw,96px)] px-[clamp(20px,5vw,64px)] bg-[linear-gradient(160deg,#0944B9,#071A52)] text-white text-center">
        <div className="max-w-[760px] mx-auto">
          <div className="w-16 h-16 rounded-full bg-brand-teal text-brand-navyDeep flex items-center justify-center mx-auto mb-6">
            <CheckBadgeIcon />
          </div>
          <h2
            className={`${DISPLAY} text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-5`}
          >
            Try Big Impact Experts Risk-Free
          </h2>
          <p className="text-[17px] leading-[1.75] text-white/85 mb-4">{config.guarantee.body}</p>
          <p className={`${DISPLAY} font-extrabold text-[19px] tracking-tight`}>
            {config.guarantee.heading}
          </p>
        </div>
      </section>

      {/* 11. CTA */}
      <section id="join" className="py-[clamp(72px,10vw,128px)] px-[clamp(20px,5vw,64px)] bg-brand-ink text-white text-center">
        <div className="max-w-[720px] mx-auto">
          <h2
            className={`${DISPLAY} text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight mb-5`}
          >
            {config.finalCta.heading}
          </h2>
          <p className="text-[17px] text-white/65 mb-8">
            {interpolatePrice(config.finalCta.subtext, price)}
          </p>
          <a
            href={checkoutUrl}
            className="inline-block bg-brand-orange text-white font-bold text-lg px-10 py-[19px] rounded-full shadow-[0_16px_40px_-12px_rgba(242,101,34,0.55)] hover:opacity-90 transition-opacity"
          >
            {interpolatePrice(config.finalCta.label, price)}
          </a>
        </div>
      </section>

      {/* 12. FAQ */}
      <section id="faq" className="py-[clamp(56px,8vw,100px)] px-[clamp(20px,5vw,64px)] bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2
            className={`${DISPLAY} text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-9`}
          >
            Frequently Asked Questions
          </h2>
          <FaqAccordion items={config.faqItems} priceLabel={price} />
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
