"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_REGISTER_PAGE_CONFIG,
  deepMerge,
  type RegisterPageConfig,
} from "@/lib/registerPageConfig";
import { DEFAULT_SALES_PAGE_CONFIG, type SalesPageConfig } from "@/lib/salesPageConfig";
import { DEFAULT_HOME_PAGE_CONFIG, type HomePageConfig } from "@/lib/homePageConfig";
import { DEFAULT_VIP_OFFER_CONFIG, type VipOfferConfig } from "@/lib/vipOfferConfig";
import {
  Section,
  ColorField,
  TextField,
  SizeField,
  ResponsiveSizeField,
} from "@/components/admin/SettingsFields";
import SalesPageSettings from "@/components/admin/SalesPageSettings";
import HomePageSettings from "@/components/admin/HomePageSettings";
import VipOfferSettings from "@/components/admin/VipOfferSettings";

type DataTool = "slugs" | null;

const TOOL_WARNINGS: Record<Exclude<DataTool, null>, { title: string; body: string; confirmLabel: string }> = {
  slugs: {
    title: "Generate slugs for all events?",
    body: "This will overwrite the existing slug on any event whose slug was auto-generated, which can change live public URLs. Events with a manually-edited slug are skipped.",
    confirmLabel: "Yes, generate slugs",
  },
};

export default function SettingsPage() {
  const [episodeCardImage, setEpisodeCardImage] = useState<"youtube_thumbnail" | "cover_art">("youtube_thumbnail");
  const [episodeGuideEnabled, setEpisodeGuideEnabled] = useState(false);
  const [shortBioMaxLength, setShortBioMaxLength] = useState(300);
  const [registerPage, setRegisterPage] = useState<RegisterPageConfig>(DEFAULT_REGISTER_PAGE_CONFIG);
  const [salesPage, setSalesPage] = useState<SalesPageConfig>(DEFAULT_SALES_PAGE_CONFIG);
  const [homePage, setHomePage] = useState<HomePageConfig>(DEFAULT_HOME_PAGE_CONFIG);
  const [vipOffer, setVipOffer] = useState<VipOfferConfig>(DEFAULT_VIP_OFFER_CONFIG);
  const [membershipCheckoutUrl, setMembershipCheckoutUrl] = useState("https://go.bigimpactexperts.com/join");
  const [membershipPriceLabel, setMembershipPriceLabel] = useState("$39/mo");
  const [vipOfferCheckoutUrl, setVipOfferCheckoutUrl] = useState("https://go.bigimpactexperts.com/vip");
  const [vipOfferPrice, setVipOfferPrice] = useState("$29/mo");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function updateColor<K extends keyof RegisterPageConfig["colors"]>(
    key: K,
    value: RegisterPageConfig["colors"][K]
  ) {
    setRegisterPage((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  }

  function updateFontSize<K extends keyof RegisterPageConfig["fontSizes"]>(
    key: K,
    value: RegisterPageConfig["fontSizes"][K]
  ) {
    setRegisterPage((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, [key]: value } }));
  }

  function updateText<K extends keyof RegisterPageConfig["text"]>(
    key: K,
    value: RegisterPageConfig["text"][K]
  ) {
    setRegisterPage((prev) => ({ ...prev, text: { ...prev.text, [key]: value } }));
  }

  function updateSize<K extends keyof RegisterPageConfig["sizes"]>(
    key: K,
    value: RegisterPageConfig["sizes"][K]
  ) {
    setRegisterPage((prev) => ({ ...prev, sizes: { ...prev.sizes, [key]: value } }));
  }

  const [dataToolsOpen, setDataToolsOpen] = useState(false);
  const [confirmTool, setConfirmTool] = useState<DataTool>(null);
  const [generatingSlugs, setGeneratingSlugs] = useState(false);
  const [toolResult, setToolResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.episodeCardImage) setEpisodeCardImage(data.episodeCardImage);
        if (data.episodeGuideEnabled !== undefined) setEpisodeGuideEnabled(data.episodeGuideEnabled);
        if (typeof data.shortBioMaxLength === "number") setShortBioMaxLength(data.shortBioMaxLength);
        if (data.registerPage) setRegisterPage(deepMerge(DEFAULT_REGISTER_PAGE_CONFIG, data.registerPage));
        if (data.salesPage) setSalesPage(deepMerge(DEFAULT_SALES_PAGE_CONFIG, data.salesPage));
        if (data.homePage) setHomePage(deepMerge(DEFAULT_HOME_PAGE_CONFIG, data.homePage));
        if (data.vipOffer) setVipOffer(deepMerge(DEFAULT_VIP_OFFER_CONFIG, data.vipOffer));
        if (typeof data.membershipCheckoutUrl === "string") setMembershipCheckoutUrl(data.membershipCheckoutUrl);
        if (typeof data.membershipPriceLabel === "string") setMembershipPriceLabel(data.membershipPriceLabel);
        if (typeof data.vipOfferCheckoutUrl === "string") setVipOfferCheckoutUrl(data.vipOfferCheckoutUrl);
        if (typeof data.vipOfferPrice === "string") setVipOfferPrice(data.vipOfferPrice);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/site-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        episodeCardImage,
        episodeGuideEnabled,
        shortBioMaxLength,
        registerPage,
        salesPage,
        homePage,
        vipOffer,
        membershipCheckoutUrl,
        membershipPriceLabel,
        vipOfferCheckoutUrl,
        vipOfferPrice,
      }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Settings saved" });
    } else {
      const err = await res.text();
      console.error("Save failed:", err);
      setMessage({ type: "error", text: "Save failed — check console for details" });
    }
    setSaving(false);
  }

  async function handleGenerateSlugs() {
    setConfirmTool(null);
    setGeneratingSlugs(true);
    setToolResult(null);
    try {
      const res = await fetch("/api/admin/episodes/generate-slugs", { method: "POST" });
      const data = await res.json();
      setToolResult(data.message ?? "Slugs generated");
    } catch {
      setToolResult("Error: slug generation failed");
    }
    setGeneratingSlugs(false);
  }

  function runConfirmedTool() {
    if (confirmTool === "slugs") handleGenerateSlugs();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Global site configuration.</p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Episode card image</h2>
        <p className="text-xs text-gray-500 mb-4">
          Choose which image to display on episode cards across the site.
        </p>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setEpisodeCardImage("youtube_thumbnail")}
            className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${episodeCardImage === "youtube_thumbnail" ? "border-brand-purple bg-purple-50 text-brand-purple" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            YouTube thumbnail
            <p className="text-xs font-normal text-gray-500 mt-0.5">16:9 widescreen, fills the card</p>
          </button>
          <button
            onClick={() => setEpisodeCardImage("cover_art")}
            className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${episodeCardImage === "cover_art" ? "border-brand-purple bg-purple-50 text-brand-purple" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            Episode cover art
            <p className="text-xs font-normal text-gray-500 mt-0.5">Square artwork, shown in full</p>
          </button>
        </div>
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Episode guide</h2>
          <p className="text-xs text-gray-500 mb-4">
            When enabled, Claude generates a downloadable PDF guide for each episode. Visitors enter their email to download.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEpisodeGuideEnabled(!episodeGuideEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${episodeGuideEnabled ? "bg-brand-purple" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${episodeGuideEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-700">
              {episodeGuideEnabled ? "Episode guides enabled" : "Episode guides disabled"}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Panelist short bio</h2>
          <p className="text-xs text-gray-500 mb-4">
            Maximum length for the AI-generated short bio shown on Meet the Experts cards
            (via the &ldquo;Shorten bio&rdquo; button on each panelist). Existing short bios
            are unaffected until regenerated.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={50}
              max={1000}
              value={shortBioMaxLength}
              onChange={(e) => setShortBioMaxLength(Number(e.target.value) || 300)}
              className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
            <span className="text-sm text-gray-500">characters</span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      <Section
        title="Register Page — Colors"
        subtitle="Brand colors used across the public registration page."
      >
        <ColorField
          label="Navy (backgrounds, headings)"
          value={registerPage.colors.navy}
          onChange={(v) => updateColor("navy", v)}
        />
        <ColorField
          label="Orange (accent, CTA button)"
          value={registerPage.colors.orange}
          onChange={(v) => updateColor("orange", v)}
        />
        <ColorField
          label="Teal (eyebrow labels)"
          value={registerPage.colors.teal}
          onChange={(v) => updateColor("teal", v)}
        />
        <ColorField
          label="Page background"
          value={registerPage.colors.bg}
          onChange={(v) => updateColor("bg", v)}
        />
      </Section>

      <Section
        title="Register Page — Font Sizes & Element Sizing"
        subtitle="Each setting applies everywhere that role appears on the page."
      >
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Eyebrow labels
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            Small uppercase labels above headings — appears 4 times on the page.
          </p>
          <ResponsiveSizeField
            label="Eyebrow size"
            value={registerPage.fontSizes.eyebrow}
            onChange={(v) => updateFontSize("eyebrow", v)}
          />
        </div>

        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hero</h3>
          <ResponsiveSizeField
            label="Hero title"
            value={registerPage.fontSizes.heroTitle}
            onChange={(v) => updateFontSize("heroTitle", v)}
          />
          <ResponsiveSizeField
            label="Subtitle / subheading text"
            value={registerPage.fontSizes.heroSubtitle}
            onChange={(v) => updateFontSize("heroSubtitle", v)}
          />
          <p className="text-xs text-gray-400">
            Subtitle size is shared with the final registration subheading.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Section headings
          </h3>
          <ResponsiveSizeField
            label="H2 heading size"
            value={registerPage.fontSizes.sectionHeading}
            onChange={(v) => updateFontSize("sectionHeading", v)}
          />
          <p className="text-xs text-gray-400">
            Shared by &ldquo;Meet the Experts&rdquo;, &ldquo;Why I Created This Event&rdquo;, and
            the final CTA heading.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Meet the Experts
          </h3>
          <SizeField
            label="Section intro text"
            value={registerPage.fontSizes.sectionSubhead}
            onChange={(v) => updateFontSize("sectionSubhead", v)}
          />
          <SizeField
            label="Expert name"
            value={registerPage.fontSizes.cardName}
            onChange={(v) => updateFontSize("cardName", v)}
          />
          <SizeField
            label="Expert title"
            value={registerPage.fontSizes.cardTitle}
            onChange={(v) => updateFontSize("cardTitle", v)}
          />
          <SizeField
            label="Expert bio"
            value={registerPage.fontSizes.cardBio}
            onChange={(v) => updateFontSize("cardBio", v)}
          />
          <ResponsiveSizeField
            label="Headshot size (diameter)"
            value={registerPage.sizes.cardHeadshot}
            onChange={(v) => updateSize("cardHeadshot", v)}
          />
        </div>

        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Host note
          </h3>
          <ResponsiveSizeField
            label="Host note body text"
            value={registerPage.fontSizes.hostNoteBody}
            onChange={(v) => updateFontSize("hostNoteBody", v)}
          />
          <SizeField
            label="Attribution line"
            value={registerPage.fontSizes.attribution}
            onChange={(v) => updateFontSize("attribution", v)}
          />
        </div>

        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Registration form
          </h3>
          <SizeField
            label="Button text"
            value={registerPage.fontSizes.buttonText}
            onChange={(v) => updateFontSize("buttonText", v)}
          />
          <SizeField
            label="Form input text"
            value={registerPage.fontSizes.formInput}
            onChange={(v) => updateFontSize("formInput", v)}
          />
          <SizeField
            label="Small print"
            value={registerPage.fontSizes.smallPrint}
            onChange={(v) => updateFontSize("smallPrint", v)}
          />
          <p className="text-xs text-gray-400">
            Small print size is shared with the footer text.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Countdown timer
          </h3>
          <ResponsiveSizeField
            label="Digits"
            value={registerPage.fontSizes.countdownDigit}
            onChange={(v) => updateFontSize("countdownDigit", v)}
          />
          <ResponsiveSizeField
            label="Labels (DAYS / HRS / MIN / SEC)"
            value={registerPage.fontSizes.countdownLabel}
            onChange={(v) => updateFontSize("countdownLabel", v)}
          />
        </div>
      </Section>

      <Section
        title="Register Page — Text Content"
        subtitle="Default copy for the page. Per-event heading/subheading overrides set in the event editor still take priority."
      >
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hero</h3>
          <TextField
            label="Eyebrow prefix (before the date)"
            value={registerPage.text.heroEyebrowPrefix}
            onChange={(v) => updateText("heroEyebrowPrefix", v)}
          />
          <TextField
            label="Default subheading"
            value={registerPage.text.defaultHeroSubheading}
            onChange={(v) => updateText("defaultHeroSubheading", v)}
            multiline
          />
          <p className="text-xs text-gray-400">
            Used only when an event doesn&rsquo;t set its own hero subheading.
          </p>
          <TextField
            label="CTA button label"
            value={registerPage.text.heroCtaButton}
            onChange={(v) => updateText("heroCtaButton", v)}
          />
          <TextField
            label="Supporting line under button"
            value={registerPage.text.heroSupportingLine}
            onChange={(v) => updateText("heroSupportingLine", v)}
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Meet the Experts
          </h3>
          <TextField
            label="Eyebrow"
            value={registerPage.text.expertsEyebrow}
            onChange={(v) => updateText("expertsEyebrow", v)}
          />
          <TextField
            label="Heading"
            value={registerPage.text.expertsHeading}
            onChange={(v) => updateText("expertsHeading", v)}
          />
          <TextField
            label="Subheading"
            value={registerPage.text.expertsSubhead}
            onChange={(v) => updateText("expertsSubhead", v)}
            multiline
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Host note
          </h3>
          <TextField
            label="Eyebrow"
            value={registerPage.text.hostNoteEyebrow}
            onChange={(v) => updateText("hostNoteEyebrow", v)}
          />
          <TextField
            label="Heading"
            value={registerPage.text.hostNoteHeading}
            onChange={(v) => updateText("hostNoteHeading", v)}
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Final CTA / registration
          </h3>
          <TextField
            label="Eyebrow prefix (before the date/time)"
            value={registerPage.text.finalCtaEyebrowPrefix}
            onChange={(v) => updateText("finalCtaEyebrowPrefix", v)}
          />
          <TextField
            label="Small print suffix (after the date/time)"
            value={registerPage.text.finalCtaSmallPrintSuffix}
            onChange={(v) => updateText("finalCtaSmallPrintSuffix", v)}
          />
          <TextField
            label="Default heading"
            value={registerPage.text.defaultRegistrationHeading}
            onChange={(v) => updateText("defaultRegistrationHeading", v)}
            multiline
          />
          <TextField
            label="Default subheading"
            value={registerPage.text.defaultRegistrationSubheading}
            onChange={(v) => updateText("defaultRegistrationSubheading", v)}
            multiline
          />
          <p className="text-xs text-gray-400">
            Used only when an event doesn&rsquo;t set its own heading/subheading.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Countdown timer
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Days label"
              value={registerPage.text.countdownDayLabel}
              onChange={(v) => updateText("countdownDayLabel", v)}
            />
            <TextField
              label="Hours label"
              value={registerPage.text.countdownHourLabel}
              onChange={(v) => updateText("countdownHourLabel", v)}
            />
            <TextField
              label="Minutes label"
              value={registerPage.text.countdownMinuteLabel}
              onChange={(v) => updateText("countdownMinuteLabel", v)}
            />
            <TextField
              label="Seconds label"
              value={registerPage.text.countdownSecondLabel}
              onChange={(v) => updateText("countdownSecondLabel", v)}
            />
          </div>
          <TextField
            label="Finished message"
            value={registerPage.text.countdownFinishedMessage}
            onChange={(v) => updateText("countdownFinishedMessage", v)}
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Other</h3>
          <TextField
            label="Footer text"
            value={registerPage.text.footerText}
            onChange={(v) => updateText("footerText", v)}
          />
          <TextField
            label="No event scheduled message"
            value={registerPage.text.nothingScheduledMessage}
            onChange={(v) => updateText("nothingScheduledMessage", v)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </Section>

      <Section
        title="Membership"
        subtitle="Referenced from the Home and Sales pages via a single field, so the price only needs to be updated in one place."
      >
        <TextField
          label="Checkout URL"
          value={membershipCheckoutUrl}
          onChange={setMembershipCheckoutUrl}
          hint="Where every 'Join'/'Become a Member' button on the public site links to."
        />
        <TextField
          label="Price label"
          value={membershipPriceLabel}
          onChange={setMembershipPriceLabel}
          hint={'Shown wherever Sales/Home page copy includes a "{price}" token.'}
        />
        <TextField
          label="VIP offer checkout URL"
          value={vipOfferCheckoutUrl}
          onChange={setVipOfferCheckoutUrl}
          hint="Where the /vip-offer page's CTA button links to."
        />
        <TextField
          label="VIP offer price label"
          value={vipOfferPrice}
          onChange={setVipOfferPrice}
          hint={'Shown wherever the VIP Offer page copy includes a "{price}" token.'}
        />
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </Section>

      <Section
        title="Sales Page (/membership)"
        subtitle="All copy on the public membership sales page."
      >
        <SalesPageSettings config={salesPage} onChange={setSalesPage} />
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </Section>

      <Section title="Home Page (/)" subtitle="All copy on the public home page.">
        <HomePageSettings config={homePage} onChange={setHomePage} />
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </Section>

      <Section
        title="VIP Offer (/vip-offer)"
        subtitle="Shown to non-members immediately after registering for an event, before the pre-event survey step."
      >
        <VipOfferSettings config={vipOffer} onChange={setVipOffer} />
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </Section>

      <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
        <button
          type="button"
          onClick={() => setDataToolsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Data tools</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bulk operations on event data — use with caution
            </p>
          </div>
          <span className={`text-gray-400 transition-transform ${dataToolsOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {dataToolsOpen && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-3">
            {confirmTool && (
              <div className="px-4 py-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  {TOOL_WARNINGS[confirmTool].title}
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  {TOOL_WARNINGS[confirmTool].body}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={runConfirmedTool}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {TOOL_WARNINGS[confirmTool].confirmLabel}
                  </button>
                  <button
                    onClick={() => setConfirmTool(null)}
                    className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {toolResult && (
              <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                {toolResult}
              </div>
            )}

            <button
              onClick={() => setConfirmTool("slugs")}
              disabled={generatingSlugs}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {generatingSlugs ? "Generating..." : "Generate slugs"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
