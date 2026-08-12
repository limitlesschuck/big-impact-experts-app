"use client";

import type { HomePageConfig, CtaTarget } from "@/lib/homePageConfig";
import { TextField } from "@/components/admin/SettingsFields";

function CtaTargetField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CtaTarget;
  onChange: (v: CtaTarget) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CtaTarget)}
        className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
      >
        <option value="membership">Sales page (/membership)</option>
        <option value="checkout">Checkout URL directly</option>
      </select>
    </div>
  );
}

export default function HomePageSettings({
  config,
  onChange,
}: {
  config: HomePageConfig;
  onChange: (config: HomePageConfig) => void;
}) {
  function set<K extends keyof HomePageConfig>(key: K, value: HomePageConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hero</h3>
        <TextField
          label="Eyebrow badge"
          value={config.hero.eyebrow}
          onChange={(v) => set("hero", { ...config.hero, eyebrow: v })}
        />
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
          label="Primary CTA button label"
          value={config.hero.primaryCtaLabel}
          onChange={(v) => set("hero", { ...config.hero, primaryCtaLabel: v })}
          hint="Always links to /register."
        />
        <TextField
          label="Secondary CTA button label"
          value={config.hero.secondaryCtaLabel}
          onChange={(v) => set("hero", { ...config.hero, secondaryCtaLabel: v })}
        />
        <CtaTargetField
          label="Secondary CTA links to"
          value={config.hero.secondaryCtaTarget}
          onChange={(v) => set("hero", { ...config.hero, secondaryCtaTarget: v })}
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Upcoming Event
        </h3>
        <p className="text-xs text-gray-400">
          Pulls the same soonest-upcoming-event data as /register and links there. Section is
          hidden entirely when nothing's scheduled.
        </p>
        <TextField
          label="Eyebrow heading"
          value={config.upcomingEvent.heading}
          onChange={(v) => set("upcomingEvent", { ...config.upcomingEvent, heading: v })}
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Meet Our Experts
        </h3>
        <p className="text-xs text-gray-400">
          Pulls the most recently presented panelists automatically — only the heading/subhead
          text is editable here.
        </p>
        <TextField
          label="Heading"
          value={config.expertsTeaser.heading}
          onChange={(v) => set("expertsTeaser", { ...config.expertsTeaser, heading: v })}
        />
        <TextField
          label="Subhead"
          value={config.expertsTeaser.subhead}
          onChange={(v) => set("expertsTeaser", { ...config.expertsTeaser, subhead: v })}
          multiline
        />
        <TextField
          label='"View full directory" link label'
          value={config.expertsTeaser.viewAllLabel}
          onChange={(v) => set("expertsTeaser", { ...config.expertsTeaser, viewAllLabel: v })}
          hint="Links to the public /experts directory."
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Become a Member
        </h3>
        <TextField
          label="Heading"
          value={config.becomeMember.heading}
          onChange={(v) => set("becomeMember", { ...config.becomeMember, heading: v })}
        />
        <TextField
          label="Body"
          value={config.becomeMember.body}
          onChange={(v) => set("becomeMember", { ...config.becomeMember, body: v })}
          multiline
          hint='Supports a "{price}" token.'
        />
        <TextField
          label="CTA button label"
          value={config.becomeMember.ctaLabel}
          onChange={(v) => set("becomeMember", { ...config.becomeMember, ctaLabel: v })}
        />
        <CtaTargetField
          label="CTA links to"
          value={config.becomeMember.ctaTarget}
          onChange={(v) => set("becomeMember", { ...config.becomeMember, ctaTarget: v })}
        />
      </div>
    </div>
  );
}
