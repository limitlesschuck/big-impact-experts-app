import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PublicExpertCard from "@/components/marketing/PublicExpertCard";
import { getSalesPageConfig } from "@/lib/getSalesPageConfig";
import { getMembershipConfig, interpolatePrice } from "@/lib/siteConfig";
import { getFeaturedPanelists } from "@/lib/eventAccess";

export const dynamic = "force-dynamic";

const FEATURED_EXPERTS_LIMIT = 9;

function SectionHeading({
  eyebrow,
  heading,
  subhead,
}: {
  eyebrow?: string;
  heading: string;
  subhead?: string;
}) {
  return (
    <div className="text-center mb-12">
      {eyebrow && (
        <p className="text-sm font-semibold text-brand-teal tracking-widest uppercase mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">{heading}</h2>
      {subhead && <p className="text-lg text-gray-500 max-w-2xl mx-auto">{subhead}</p>}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-brand-orange">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default async function MembershipPage() {
  const [config, membership, experts] = await Promise.all([
    getSalesPageConfig(),
    getMembershipConfig(),
    getFeaturedPanelists(FEATURED_EXPERTS_LIMIT),
  ]);

  const price = membership.priceLabel;
  const checkoutUrl = membership.checkoutUrl;

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
            href={checkoutUrl}
            className="inline-block px-10 py-5 bg-brand-orange text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            {config.hero.ctaLabel}
          </a>
        </div>
      </div>

      {/* 1. What Is Big Impact Experts? */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-6">
          {config.whatIsSection.heading}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">{config.whatIsSection.body}</p>
      </div>

      {/* 2. Enhance Every Area of Your Business */}
      <div className="bg-brand-bg">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
          <SectionHeading heading={config.enhanceSection.heading} />
          <ul className="space-y-5 max-w-2xl mx-auto">
            {config.enhanceSection.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-lg text-gray-700">
                <span className="mt-1">
                  <CheckIcon />
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. How Our Program Works */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
        <SectionHeading heading={config.howItWorks.heading} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {config.howItWorks.items.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-brand-orange mb-2">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Learn From The Best Experts */}
      {experts.length > 0 && (
        <div className="bg-brand-bg">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
            <SectionHeading
              heading={config.expertsSection.heading}
              subhead={config.expertsSection.intro}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((p) => (
                <PublicExpertCard key={p.id} panelist={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Explore Topics Like */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-4">
          {config.topicsSection.heading}
        </h2>
        <p className="text-lg text-gray-600">{config.topicsSection.body}</p>
      </div>

      {/* 6. What You Get With Membership */}
      <div className="bg-brand-bg">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
          <SectionHeading heading={config.whatYouGet.heading} />
          <ul className="space-y-5 max-w-2xl mx-auto">
            {config.whatYouGet.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-lg text-gray-700">
                <span className="mt-1">
                  <CheckIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 7. Program Value */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
        <p className="text-sm font-semibold text-brand-teal tracking-widest uppercase mb-4">
          {config.programValue.heading}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-brand-navy leading-snug">
          {config.programValue.body}
        </p>
      </div>

      {/* 8. Advanced AI Expert Match */}
      <div className="bg-brand-navy">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {config.aiExpertMatch.heading}
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">{config.aiExpertMatch.body}</p>
        </div>
      </div>

      {/* 9. Testimonials */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
        <SectionHeading heading="What Our Members Say" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.testimonials.map((t, i) => (
            <video
              key={i}
              src={t.videoUrl}
              controls
              className="w-full aspect-[9/16] rounded-xl bg-gray-100 object-cover"
            />
          ))}
        </div>
      </div>

      {/* 10. Getting Started Is Easy */}
      <div className="bg-brand-bg">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
          <SectionHeading heading={config.gettingStarted.heading} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.gettingStarted.steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">
                  {interpolatePrice(step.description, price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 11. Guarantee */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <div className="bg-white border-2 border-brand-orange/30 rounded-2xl p-10 text-center">
          <p className="text-lg text-gray-600 leading-relaxed mb-6">{config.guarantee.body}</p>
          <p className="text-xl font-bold text-brand-navy">{config.guarantee.heading}</p>
        </div>
      </div>

      {/* 12. CTA */}
      <div className="bg-brand-navy">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            {config.finalCta.heading}
          </h2>
          <a
            href={checkoutUrl}
            className="inline-block px-10 py-5 bg-brand-orange text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            {interpolatePrice(config.finalCta.label, price)}
          </a>
        </div>
      </div>

      {/* 13. FAQ */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <SectionHeading heading="Frequently Asked Questions" />
        <div className="space-y-6">
          {config.faqItems.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-6">
              <p className="text-base font-bold text-gray-900 mb-2">{item.question}</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {interpolatePrice(item.answer, price)}
              </p>
            </div>
          ))}
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
