// Admin-editable copy for /vip-offer, stored in SiteConfig.config.vipOffer.
// Same defaults + deepMerge pattern as salesPageConfig.ts/homePageConfig.ts.
// The price itself (vipOfferPrice) and the checkout link
// (vipOfferCheckoutUrl) live in lib/siteConfig.ts's getMembershipConfig,
// not here -- same "flat economics value, referenced via a {price}
// token" reasoning as the regular membership price.

export interface BonusItem {
  title: string;
  value: string;
  description: string;
}

export interface VipOfferConfig {
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
  };
  offerSection: {
    heading: string;
    body: string;
  };
  bonuses: BonusItem[];
  finalCta: {
    label: string;
    subtext: string;
  };
  declineLabel: string;
}

export const DEFAULT_VIP_OFFER_CONFIG: VipOfferConfig = {
  hero: {
    eyebrow: "Special One-Time Offer",
    headline: "Before You Go — Upgrade To Membership At A Special Price",
    subhead:
      "You just reserved your seat. As a thank-you, you can lock in membership at {price} instead of the regular price — this offer won't be shown again.",
  },
  offerSection: {
    heading: "What You Get",
    body: "Full membership access — live monthly expert panels, every past replay, expert guides, VIP gifts, and AI Expert Match — for just {price}.",
  },
  bonuses: [
    {
      title: "Free Ticket To The Next Impact Accelerator Workshop",
      value: "$97 value",
      description: "A seat at our next live workshop, included at no extra cost.",
    },
    {
      title: "Affiliate Accelerator Course",
      value: "$295 value",
      description:
        "The complete course on building affiliate and referral partnerships that compound.",
    },
  ],
  finalCta: {
    label: "Yes — Upgrade Me At {price}",
    subtext: "One-time offer. Won't be shown again.",
  },
  declineLabel: "No thanks, just take me to my confirmation",
};
