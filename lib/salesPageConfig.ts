// Admin-editable copy for /membership, stored in SiteConfig.config.salesPage.
// Same pattern as registerPageConfig.ts: hardcoded defaults + deepMerge over
// whatever's actually stored, so a partially-filled-in or never-touched
// config row still renders something complete.

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialSlot {
  videoUrl: string;
}

export interface TitledItem {
  title: string;
  description: string;
}

export interface SalesPageConfig {
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    ctaLabel: string;
    supportingLine: string;
  };
  whatIsSection: {
    heading: string;
    // Rendered paragraph-by-paragraph (split on blank lines) -- the first
    // paragraph gets the larger "pull quote" display treatment from the
    // design reference, the rest render as normal body copy.
    body: string;
  };
  enhanceSection: {
    heading: string;
    subhead: string;
    bullets: TitledItem[];
  };
  howItWorks: {
    heading: string;
    items: TitledItem[];
  };
  expertsSection: {
    heading: string;
    intro: string;
  };
  topicsSection: {
    heading: string;
    body: string;
    topics: string[];
  };
  whatYouGet: {
    heading: string;
    items: string[];
  };
  programValue: {
    heading: string;
    body: string;
  };
  aiExpertMatch: {
    heading: string;
    body: string;
    // Decorative only -- these link to Become a Member, they don't drive
    // any real matching. The real Expert Match feature is member-only
    // (it needs an authenticated session), so there's no way to make a
    // public-page demo of it genuinely live without new API surface.
    challenges: string[];
  };
  testimonials: TestimonialSlot[];
  gettingStarted: {
    heading: string;
    steps: TitledItem[];
  };
  guarantee: {
    heading: string;
    body: string;
  };
  finalCta: {
    heading: string;
    label: string;
    subtext: string;
  };
  faqItems: FaqItem[];
}

const COMING_SOON_CLIP =
  "https://pub-7416c148113046a29d810455864e834f.r2.dev/panelist-clips/coming-soon-1786333454930.mp4";

export const DEFAULT_SALES_PAGE_CONFIG: SalesPageConfig = {
  hero: {
    eyebrow: "Free Monthly Expert Panels",
    headline: "Learn Directly From The Experts Who've Already Built What You're Building",
    subhead:
      "Get instant access to live monthly expert panels, guides, replays, and AI-powered expert matching — for less than the price of one coaching call.",
    ctaLabel: "Start Your Membership",
    supportingLine: "Cancel anytime · Instant access",
  },
  whatIsSection: {
    heading: "What Is Big Impact Experts?",
    body: "You didn't start your business to do it alone. But somewhere between \"just getting started\" and \"actually making sales,\" most coaches and consultants end up exactly there — posting content nobody sees, chasing leads that don't convert, and wondering why the thing that worked for someone else isn't working for you.\n\nBig Impact Experts exists to close that gap. Every month, we bring together proven experts — people who've already built the visibility, the partnerships, and the consistent income you're working toward — and give you direct access to how they actually did it. No theory. No recycled advice. Just the real frameworks, from people who've used them.",
  },
  enhanceSection: {
    heading: "Enhance Every Area of Your Business",
    subhead: "Whatever's holding your business back, there's an expert who's already solved it.",
    bullets: [
      {
        title: "Get Seen",
        description: "Visibility strategies from experts who've built real audiences, not just followers",
      },
      {
        title: "Get Paid To Speak",
        description: "Position yourself and your message so event planners come to you",
      },
      {
        title: "Fix What's Blocking You",
        description: "The mindset and procrastination patterns quietly stalling your growth",
      },
      {
        title: "Build Real Partnerships",
        description: "The affiliate and referral relationships that create consistent, compounding growth",
      },
      {
        title: "Turn Your Story Into Your Business",
        description: "The frameworks for owning your message with confidence",
      },
    ],
  },
  howItWorks: {
    heading: "How Our Program Works",
    items: [
      {
        title: "Live Monthly Events",
        description: "Free panels with 5+ industry experts, every month.",
      },
      {
        title: "Guides & Action Checklists",
        description: "Key frameworks and next steps from every session, ready to use.",
      },
      {
        title: "Session Replays & Clips",
        description: "Go back anytime, learn at your own pace.",
      },
      {
        title: "AI Expert Match",
        description:
          "Describe your challenge, get matched instantly with the expert whose approach fits — no more guessing who to ask.",
      },
    ],
  },
  expertsSection: {
    heading: "Learn From The Best Experts",
    intro:
      "These aren't theorists. Every expert on our panels has built the exact kind of business, audience, or income you're working toward — and they're sharing exactly how.",
  },
  topicsSection: {
    heading: "Explore Topics Like",
    body: "Covering 50+ areas of expertise — from visibility and sales to mindset, partnerships, and business growth.",
    topics: [
      "Public Speaking",
      "Affiliate Marketing & Partnerships",
      "Overcoming Procrastination",
      "Mindset & Confidence",
      "Personal Branding",
      "Content Strategy",
      "Lead Generation",
      "Sales Conversion",
      "Storytelling for Business",
      "Business Coaching",
      "Client Acquisition",
      "Visibility & Audience Growth",
      "Offer Creation",
      "Pricing Strategy",
      "Referral Partnerships",
      "Speaker Positioning",
      "Personal Transformation",
      "Health & Wellness Coaching",
      "Business Breakthroughs",
      "Transformational Leadership",
    ],
  },
  whatYouGet: {
    heading: "What You Get With Membership",
    items: [
      "Every past event replay, permanently",
      "Every expert's Guide — frameworks, takeaways, and quotes, ready to apply",
      "Exclusive VIP gifts from our experts, members-only",
      "Full access to our Expert Directory",
      "AI Expert Match — get matched to the right expert for your specific challenge",
    ],
  },
  programValue: {
    heading: "Program Value",
    body: "$24,972 worth of expert programs and resources — included in your membership.",
  },
  aiExpertMatch: {
    heading: "Advanced AI Expert Match",
    body: "Describe your challenge in plain English, and our AI instantly searches every expert's guide content to match you with the right person to learn from — no scrolling through past sessions trying to guess who might have the answer. If nothing in our library directly answers your question, you can send it straight to our team for a personal follow-up.",
    challenges: [
      "I'm invisible online",
      "I want to get paid to speak",
      "I keep self-sabotaging",
      "I need better partnerships",
      "My story isn't converting",
      "My leads don't convert",
    ],
  },
  testimonials: [
    { videoUrl: COMING_SOON_CLIP },
    { videoUrl: COMING_SOON_CLIP },
    { videoUrl: COMING_SOON_CLIP },
    { videoUrl: COMING_SOON_CLIP },
    { videoUrl: COMING_SOON_CLIP },
    { videoUrl: COMING_SOON_CLIP },
  ],
  gettingStarted: {
    heading: "Getting Started Is Easy",
    steps: [
      { title: "Join", description: "{price}, cancel anytime." },
      { title: "Get instant access", description: "Every replay, guide, and gift, unlocked immediately." },
      { title: "Ask our AI", description: "Get matched to the right expert for your challenge." },
      { title: "Go deeper", description: "Watch their clip, read their guide, claim their gift." },
    ],
  },
  guarantee: {
    heading: "100% Money-Back Guarantee — No Questions Asked",
    body: "Try Big Impact Experts Risk-Free. Join today and get full access to every replay, guide, and expert gift — immediately. If within 60 days you don't feel you're getting real value from your membership, just cancel and request a refund. No forms, no hoops, no explanation needed. We can offer this because we know what's inside actually works — real strategies from experts who've built what you're trying to build. Try it. If it's not for you, you get your money back.",
  },
  finalCta: {
    heading: "Ready When You Are",
    label: "Join Now — {price}",
    subtext: "{price}. Cancel anytime. 60-day money-back guarantee.",
  },
  faqItems: [
    {
      id: "faq-1",
      question: "What's included in my membership?",
      answer:
        "Full access to every event replay, expert guide, VIP gift, our expert directory, and AI Expert Match — updated after every new event.",
    },
    {
      id: "faq-2",
      question: "How much does it cost?",
      answer: "{price}. Cancel anytime.",
    },
    {
      id: "faq-3",
      question: "Is there a contract or commitment?",
      answer: "No. Membership is month-to-month — cancel whenever you'd like.",
    },
    {
      id: "faq-4",
      question: "How often is new content added?",
      answer: "After every monthly panel event, with new replays, guides, and gifts added for members.",
    },
    {
      id: "faq-5",
      question: "What if it's not right for me?",
      answer: "You're covered by our 60-day, no-questions-asked money-back guarantee.",
    },
    {
      id: "faq-6",
      question: "How does AI Expert Match work?",
      answer:
        "Describe your challenge, and our AI instantly matches you with the expert whose approach fits — so you always know exactly who to learn from next.",
    },
  ],
};
