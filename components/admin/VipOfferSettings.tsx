"use client";

import type { VipOfferConfig, BonusItem } from "@/lib/vipOfferConfig";
import { TextField } from "@/components/admin/SettingsFields";

export default function VipOfferSettings({
  config,
  onChange,
}: {
  config: VipOfferConfig;
  onChange: (config: VipOfferConfig) => void;
}) {
  function set<K extends keyof VipOfferConfig>(key: K, value: VipOfferConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  function updateBonus(index: number, patch: Partial<BonusItem>) {
    const bonuses = [...config.bonuses];
    bonuses[index] = { ...bonuses[index], ...patch };
    set("bonuses", bonuses);
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
          hint='Supports a "{price}" token, resolved against the VIP offer price set under Membership.'
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          What You Get
        </h3>
        <TextField
          label="Heading"
          value={config.offerSection.heading}
          onChange={(v) => set("offerSection", { ...config.offerSection, heading: v })}
        />
        <TextField
          label="Body"
          value={config.offerSection.body}
          onChange={(v) => set("offerSection", { ...config.offerSection, body: v })}
          multiline
          hint='Supports a "{price}" token.'
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Bonuses (fixed at two)
        </h3>
        {config.bonuses.map((bonus, i) => (
          <div key={i} className="space-y-2 p-3 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-400">Bonus {i + 1}</p>
            <TextField
              label="Title"
              value={bonus.title}
              onChange={(v) => updateBonus(i, { title: v })}
            />
            <TextField
              label="Value label"
              value={bonus.value}
              onChange={(v) => updateBonus(i, { value: v })}
              hint='e.g. "$97 value"'
            />
            <TextField
              label="Description"
              value={bonus.description}
              onChange={(v) => updateBonus(i, { description: v })}
              multiline
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Final CTA</h3>
        <TextField
          label="Button label"
          value={config.finalCta.label}
          onChange={(v) => set("finalCta", { ...config.finalCta, label: v })}
          hint='Supports a "{price}" token. Links to the VIP checkout URL set under Membership.'
        />
        <TextField
          label="Subtext under the button"
          value={config.finalCta.subtext}
          onChange={(v) => set("finalCta", { ...config.finalCta, subtext: v })}
        />
        <TextField
          label="Decline link label"
          value={config.declineLabel}
          onChange={(v) => set("declineLabel", v)}
          hint="Links onward to /confirmation."
        />
      </div>
    </div>
  );
}
