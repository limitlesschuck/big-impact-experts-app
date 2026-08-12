// Admin-editable copy for the Home page ("/"), stored in
// SiteConfig.config.homePage. Same defaults + deepMerge pattern as
// salesPageConfig.ts / registerPageConfig.ts.

export type CtaTarget = "membership" | "checkout";

export interface HomePageConfig {
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    // Always links to /register -- "reserve a seat" only ever means one
    // thing, unlike the membership CTA below which has a real admin
    // choice of destination.
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    secondaryCtaTarget: CtaTarget;
  };
  upcomingEvent: {
    heading: string;
  };
  expertsTeaser: {
    heading: string;
    subhead: string;
    viewAllLabel: string;
  };
  becomeMember: {
    heading: string;
    body: string;
    ctaLabel: string;
    ctaTarget: CtaTarget;
  };
}

export const DEFAULT_HOME_PAGE_CONFIG: HomePageConfig = {
  hero: {
    eyebrow: "Free Monthly Expert Panels",
    headline: "Learn Directly From The Experts Who've Already Built What You're Building",
    subhead:
      "Join a growing community of coaches and consultants learning directly from the experts who've already built what you're building.",
    primaryCtaLabel: "Reserve a Free Seat",
    secondaryCtaLabel: "Become a Member",
    secondaryCtaTarget: "membership",
  },
  upcomingEvent: {
    heading: "Upcoming Event",
  },
  expertsTeaser: {
    heading: "Meet Our Experts",
    subhead: "A few of the proven experts sharing exactly how they built what you're building.",
    viewAllLabel: "View full directory",
  },
  becomeMember: {
    heading: "Ready to Learn From The Best?",
    body: "Get instant access to live monthly expert panels, guides, replays, and AI-powered expert matching — for {price}.",
    ctaLabel: "Become a Member",
    ctaTarget: "membership",
  },
};
