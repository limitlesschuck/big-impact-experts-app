// Admin-configurable design system for /register (colors, font sizes,
// static copy), stored in SiteConfig.config.registerPage. Values are
// interpolated into a real <style> block server-side, so every value
// is format-validated before use -- this is admin-only input (role-
// gated in the settings API), but we don't trust it blindly into raw
// CSS text regardless.

export interface ResponsiveSize {
  base: string;
  sm: string;
  lg: string;
}

export interface RegisterPageConfig {
  colors: {
    navy: string;
    orange: string;
    teal: string;
    bg: string;
  };
  fontSizes: {
    eyebrow: ResponsiveSize;
    heroTitle: ResponsiveSize;
    heroSubtitle: ResponsiveSize;
    sectionHeading: ResponsiveSize;
    sectionSubhead: string;
    cardName: string;
    cardTitle: string;
    cardBio: string;
    hostNoteBody: ResponsiveSize;
    attribution: string;
    buttonText: string;
    smallPrint: string;
    countdownDigit: ResponsiveSize;
    countdownLabel: ResponsiveSize;
    formInput: string;
  };
  sizes: {
    cardHeadshot: ResponsiveSize;
  };
  text: {
    heroEyebrowPrefix: string;
    heroCtaButton: string;
    heroSupportingLine: string;
    expertsEyebrow: string;
    expertsHeading: string;
    expertsSubhead: string;
    hostNoteEyebrow: string;
    hostNoteHeading: string;
    finalCtaEyebrowPrefix: string;
    finalCtaSmallPrintSuffix: string;
    footerText: string;
    nothingScheduledMessage: string;
    defaultHeroSubheading: string;
    defaultRegistrationHeading: string;
    defaultRegistrationSubheading: string;
    countdownDayLabel: string;
    countdownHourLabel: string;
    countdownMinuteLabel: string;
    countdownSecondLabel: string;
    countdownFinishedMessage: string;
  };
}

export const DEFAULT_REGISTER_PAGE_CONFIG: RegisterPageConfig = {
  colors: {
    navy: "#0944B9",
    orange: "#F26522",
    teal: "#4ECDC4",
    bg: "#F7F8FC",
  },
  fontSizes: {
    eyebrow: { base: "0.875rem", sm: "1rem", lg: "1rem" },
    heroTitle: { base: "2.25rem", sm: "3rem", lg: "3.75rem" },
    heroSubtitle: { base: "1.125rem", sm: "1.25rem", lg: "1.25rem" },
    sectionHeading: { base: "1.875rem", sm: "2.25rem", lg: "3rem" },
    sectionSubhead: "1.125rem",
    cardName: "1.125rem",
    cardTitle: "1rem",
    cardBio: "1rem",
    hostNoteBody: { base: "1.125rem", sm: "1.25rem", lg: "1.25rem" },
    attribution: "1rem",
    buttonText: "1.125rem",
    smallPrint: "0.875rem",
    countdownDigit: { base: "2.25rem", sm: "3rem", lg: "3.75rem" },
    countdownLabel: { base: "0.75rem", sm: "0.875rem", lg: "0.875rem" },
    formInput: "1rem",
  },
  sizes: {
    cardHeadshot: { base: "7rem", sm: "8rem", lg: "8rem" },
  },
  text: {
    heroEyebrowPrefix: "Free Live Event —",
    heroCtaButton: "Save My Free Seat Now",
    heroSupportingLine: "Free to attend. Limited seats. Register now to secure your spot.",
    expertsEyebrow: "Meet the Experts",
    expertsHeading: "Learn From These Industry Leaders",
    expertsSubhead: "Each expert brings a distinct, proven strategy you can apply immediately.",
    hostNoteEyebrow: "A Note From Your Host",
    hostNoteHeading: "Why I Created This Event",
    finalCtaEyebrowPrefix: "Join Us Live on",
    finalCtaSmallPrintSuffix: "Free to attend",
    footerText: "BigImpactExperts.com",
    nothingScheduledMessage: "Nothing scheduled right now — check back soon.",
    defaultHeroSubheading:
      "Join us live for an actionable session packed with strategies you can apply immediately.",
    defaultRegistrationHeading: "Ready to Grow Your Impact, Influence, and Income?",
    defaultRegistrationSubheading:
      "YES! I Want To Attend This Free Event With Chuck Anderson & Learn How To Make A Bigger Impact, Grow My Influence, And Earn More Profit — From 6 Industry Experts In Just 90 Minutes!",
    countdownDayLabel: "DAYS",
    countdownHourLabel: "HRS",
    countdownMinuteLabel: "MIN",
    countdownSecondLabel: "SEC",
    countdownFinishedMessage: "This event has started",
  },
};

// Re-exported for existing callers (getRegisterPageConfig.ts, settings
// page) -- the implementation now lives in lib/deepMerge.ts since
// salesPageConfig/homePageConfig need the same helper.
export { deepMerge } from "@/lib/deepMerge";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const CSS_SIZE_RE = /^\d+(\.\d+)?(rem|em|px)$/;

function safeColor(value: string, fallback: string): string {
  return HEX_COLOR_RE.test(value) ? value : fallback;
}

function safeSize(value: string, fallback: string): string {
  return CSS_SIZE_RE.test(value) ? value : fallback;
}

// Builds the CSS text for the <style> block, validating every
// interpolated value against a strict format first.
export function buildRegisterPageCss(config: RegisterPageConfig): string {
  const d = DEFAULT_REGISTER_PAGE_CONFIG;
  const c = {
    navy: safeColor(config.colors.navy, d.colors.navy),
    orange: safeColor(config.colors.orange, d.colors.orange),
    teal: safeColor(config.colors.teal, d.colors.teal),
    bg: safeColor(config.colors.bg, d.colors.bg),
  };

  const size = (value: string, fallback: string) => safeSize(value, fallback);
  const responsive = (
    className: string,
    property: "font-size",
    value: ResponsiveSize,
    fallback: ResponsiveSize
  ) => `
    .${className} { ${property}: ${size(value.base, fallback.base)}; }
    @media (min-width: 640px) { .${className} { ${property}: ${size(value.sm, fallback.sm)}; } }
    @media (min-width: 1024px) { .${className} { ${property}: ${size(value.lg, fallback.lg)}; } }
  `;

  const responsiveBox = (className: string, value: ResponsiveSize, fallback: ResponsiveSize) => `
    .${className} { width: ${size(value.base, fallback.base)}; height: ${size(value.base, fallback.base)}; }
    @media (min-width: 640px) { .${className} { width: ${size(value.sm, fallback.sm)}; height: ${size(value.sm, fallback.sm)}; } }
    @media (min-width: 1024px) { .${className} { width: ${size(value.lg, fallback.lg)}; height: ${size(value.lg, fallback.lg)}; } }
  `;

  const f = config.fontSizes;
  const fd = d.fontSizes;
  const s = config.sizes;
  const sd = d.sizes;

  return `
    .rp-navy { color: ${c.navy}; }
    .rp-bg-navy { background-color: ${c.navy}; }
    .rp-orange { color: ${c.orange}; }
    .rp-bg-orange { background-color: ${c.orange}; }
    .rp-teal { color: ${c.teal}; }
    .rp-bg-page { background-color: ${c.bg}; }

    ${responsive("rp-eyebrow", "font-size", f.eyebrow, fd.eyebrow)}
    ${responsive("rp-hero-title", "font-size", f.heroTitle, fd.heroTitle)}
    ${responsive("rp-hero-subtitle", "font-size", f.heroSubtitle, fd.heroSubtitle)}
    ${responsive("rp-section-heading", "font-size", f.sectionHeading, fd.sectionHeading)}
    ${responsive("rp-host-note-body", "font-size", f.hostNoteBody, fd.hostNoteBody)}
    ${responsive("rp-countdown-digit", "font-size", f.countdownDigit, fd.countdownDigit)}
    ${responsive("rp-countdown-label", "font-size", f.countdownLabel, fd.countdownLabel)}
    ${responsiveBox("rp-card-headshot", s.cardHeadshot, sd.cardHeadshot)}

    .rp-section-subhead { font-size: ${size(f.sectionSubhead, fd.sectionSubhead)}; }
    .rp-card-name { font-size: ${size(f.cardName, fd.cardName)}; }
    .rp-card-title { font-size: ${size(f.cardTitle, fd.cardTitle)}; }
    .rp-card-bio { font-size: ${size(f.cardBio, fd.cardBio)}; }
    .rp-attribution { font-size: ${size(f.attribution, fd.attribution)}; }
    .rp-button-text { font-size: ${size(f.buttonText, fd.buttonText)}; }
    .rp-small-print { font-size: ${size(f.smallPrint, fd.smallPrint)}; }
    .rp-form-input { font-size: ${size(f.formInput, fd.formInput)}; }
  `;
}
