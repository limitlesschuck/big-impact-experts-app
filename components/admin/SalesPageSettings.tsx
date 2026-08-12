"use client";

import type { SalesPageConfig, FaqItem, TitledItem } from "@/lib/salesPageConfig";
import { TextField } from "@/components/admin/SettingsFields";
import FaqListEditor from "@/components/admin/FaqListEditor";
import TestimonialVideoField from "@/components/admin/TestimonialVideoField";

export default function SalesPageSettings({
  config,
  onChange,
}: {
  config: SalesPageConfig;
  onChange: (config: SalesPageConfig) => void;
}) {
  function set<K extends keyof SalesPageConfig>(key: K, value: SalesPageConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  function updateBullet(index: number, value: string) {
    const bullets = [...config.enhanceSection.bullets];
    bullets[index] = value;
    set("enhanceSection", { ...config.enhanceSection, bullets });
  }

  function updateGetItem(index: number, value: string) {
    const items = [...config.whatYouGet.items];
    items[index] = value;
    set("whatYouGet", { ...config.whatYouGet, items });
  }

  function updateTitledItem(
    section: "howItWorks" | "gettingStarted",
    field: "items" | "steps",
    index: number,
    patch: Partial<TitledItem>
  ) {
    if (section === "howItWorks") {
      const items = [...config.howItWorks.items];
      items[index] = { ...items[index], ...patch };
      set("howItWorks", { ...config.howItWorks, items });
    } else {
      const steps = [...config.gettingStarted.steps];
      steps[index] = { ...steps[index], ...patch };
      set("gettingStarted", { ...config.gettingStarted, steps });
    }
  }

  function updateTestimonial(index: number, videoUrl: string) {
    const testimonials = [...config.testimonials];
    testimonials[index] = { videoUrl };
    set("testimonials", testimonials);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hero</h3>
        <TextField
          label="Headline"
          value={config.hero.headline}
          onChange={(v) => set("hero", { ...config.hero, headline: v })}
          multiline
        />
        <TextField
          label="Subhead"
          value={config.hero.subhead}
          onChange={(v) => set("hero", { ...config.hero, subhead: v })}
          multiline
        />
        <TextField
          label="CTA button label"
          value={config.hero.ctaLabel}
          onChange={(v) => set("hero", { ...config.hero, ctaLabel: v })}
          hint="Links to the checkout URL set under Membership."
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          1. What Is Big Impact Experts?
        </h3>
        <TextField
          label="Heading"
          value={config.whatIsSection.heading}
          onChange={(v) => set("whatIsSection", { ...config.whatIsSection, heading: v })}
        />
        <TextField
          label="Body"
          value={config.whatIsSection.body}
          onChange={(v) => set("whatIsSection", { ...config.whatIsSection, body: v })}
          multiline
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          2. Enhance Every Area of Your Business
        </h3>
        <TextField
          label="Heading"
          value={config.enhanceSection.heading}
          onChange={(v) => set("enhanceSection", { ...config.enhanceSection, heading: v })}
        />
        {config.enhanceSection.bullets.map((bullet, i) => (
          <TextField
            key={i}
            label={`Bullet ${i + 1}`}
            value={bullet}
            onChange={(v) => updateBullet(i, v)}
          />
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          3. How Our Program Works
        </h3>
        <TextField
          label="Heading"
          value={config.howItWorks.heading}
          onChange={(v) => set("howItWorks", { ...config.howItWorks, heading: v })}
        />
        {config.howItWorks.items.map((item, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <TextField
              label={`Item ${i + 1} title`}
              value={item.title}
              onChange={(v) => updateTitledItem("howItWorks", "items", i, { title: v })}
            />
            <TextField
              label={`Item ${i + 1} description`}
              value={item.description}
              onChange={(v) => updateTitledItem("howItWorks", "items", i, { description: v })}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          4. Learn From The Best Experts
        </h3>
        <p className="text-xs text-gray-400">
          Expert cards themselves pull real panelist profiles automatically — only the
          heading/intro text is editable here.
        </p>
        <TextField
          label="Heading"
          value={config.expertsSection.heading}
          onChange={(v) => set("expertsSection", { ...config.expertsSection, heading: v })}
        />
        <TextField
          label="Intro"
          value={config.expertsSection.intro}
          onChange={(v) => set("expertsSection", { ...config.expertsSection, intro: v })}
          multiline
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          5. Explore Topics Like
        </h3>
        <TextField
          label="Heading"
          value={config.topicsSection.heading}
          onChange={(v) => set("topicsSection", { ...config.topicsSection, heading: v })}
        />
        <TextField
          label="Body"
          value={config.topicsSection.body}
          onChange={(v) => set("topicsSection", { ...config.topicsSection, body: v })}
          multiline
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          6. What You Get With Membership
        </h3>
        <TextField
          label="Heading"
          value={config.whatYouGet.heading}
          onChange={(v) => set("whatYouGet", { ...config.whatYouGet, heading: v })}
        />
        {config.whatYouGet.items.map((item, i) => (
          <TextField
            key={i}
            label={`Item ${i + 1}`}
            value={item}
            onChange={(v) => updateGetItem(i, v)}
          />
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          7. Program Value
        </h3>
        <TextField
          label="Eyebrow"
          value={config.programValue.heading}
          onChange={(v) => set("programValue", { ...config.programValue, heading: v })}
        />
        <TextField
          label="Body"
          value={config.programValue.body}
          onChange={(v) => set("programValue", { ...config.programValue, body: v })}
          multiline
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          8. Advanced AI Expert Match
        </h3>
        <TextField
          label="Heading"
          value={config.aiExpertMatch.heading}
          onChange={(v) => set("aiExpertMatch", { ...config.aiExpertMatch, heading: v })}
        />
        <TextField
          label="Body"
          value={config.aiExpertMatch.body}
          onChange={(v) => set("aiExpertMatch", { ...config.aiExpertMatch, body: v })}
          multiline
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          9. Testimonials
        </h3>
        <p className="text-xs text-gray-400">
          Six fixed video slots — replace each individually. New slots default to a "coming soon"
          placeholder clip until replaced.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {config.testimonials.map((t, i) => (
            <TestimonialVideoField
              key={i}
              label={`Slot ${i + 1}`}
              value={t.videoUrl}
              onChange={(url) => updateTestimonial(i, url)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          10. Getting Started Is Easy
        </h3>
        <TextField
          label="Heading"
          value={config.gettingStarted.heading}
          onChange={(v) => set("gettingStarted", { ...config.gettingStarted, heading: v })}
        />
        {config.gettingStarted.steps.map((step, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <TextField
              label={`Step ${i + 1} title`}
              value={step.title}
              onChange={(v) => updateTitledItem("gettingStarted", "steps", i, { title: v })}
            />
            <TextField
              label={`Step ${i + 1} description`}
              value={step.description}
              onChange={(v) => updateTitledItem("gettingStarted", "steps", i, { description: v })}
              hint={i === 0 ? 'Supports a "{price}" token.' : undefined}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          11. Guarantee
        </h3>
        <TextField
          label="Body"
          value={config.guarantee.body}
          onChange={(v) => set("guarantee", { ...config.guarantee, body: v })}
          multiline
        />
        <TextField
          label="Closing line / badge text"
          value={config.guarantee.heading}
          onChange={(v) => set("guarantee", { ...config.guarantee, heading: v })}
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">12. CTA</h3>
        <TextField
          label="Heading"
          value={config.finalCta.heading}
          onChange={(v) => set("finalCta", { ...config.finalCta, heading: v })}
        />
        <TextField
          label="Button label"
          value={config.finalCta.label}
          onChange={(v) => set("finalCta", { ...config.finalCta, label: v })}
          hint='Supports a "{price}" token. Links to the checkout URL set under Membership.'
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">13. FAQ</h3>
        <FaqListEditor
          items={config.faqItems}
          onChange={(items: FaqItem[]) => set("faqItems", items)}
        />
      </div>
    </div>
  );
}
