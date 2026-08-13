import { prisma } from "@/lib/prisma";

export interface MembershipConfig {
  checkoutUrl: string;
  priceLabel: string;
  vipOfferCheckoutUrl: string;
  vipOfferPrice: string;
}

const DEFAULT_MEMBERSHIP_CONFIG: MembershipConfig = {
  checkoutUrl: "https://go.bigimpactexperts.com/join",
  priceLabel: "$39/mo",
  vipOfferCheckoutUrl: "https://go.bigimpactexperts.com/vip",
  vipOfferPrice: "$29/mo",
};

// Flat top-level SiteConfig keys (peers of episodeCardImage/defaultHost),
// not namespaced under a page config -- the price and checkout link are
// referenced from copy on both the Sales and Home pages via the {price}
// token (see interpolatePrice below), so they live independently of
// either page's own config object. The VIP offer fields are the same
// flavor of value (a checkout economics pair) for a second, separate
// offer, so they live here too rather than in their own module.
export async function getMembershipConfig(): Promise<MembershipConfig> {
  const record = await prisma.siteConfig.findFirst();
  const config = record?.config as Record<string, unknown> | null;
  return {
    checkoutUrl:
      typeof config?.membershipCheckoutUrl === "string" && config.membershipCheckoutUrl
        ? config.membershipCheckoutUrl
        : DEFAULT_MEMBERSHIP_CONFIG.checkoutUrl,
    priceLabel:
      typeof config?.membershipPriceLabel === "string" && config.membershipPriceLabel
        ? config.membershipPriceLabel
        : DEFAULT_MEMBERSHIP_CONFIG.priceLabel,
    vipOfferCheckoutUrl:
      typeof config?.vipOfferCheckoutUrl === "string" && config.vipOfferCheckoutUrl
        ? config.vipOfferCheckoutUrl
        : DEFAULT_MEMBERSHIP_CONFIG.vipOfferCheckoutUrl,
    vipOfferPrice:
      typeof config?.vipOfferPrice === "string" && config.vipOfferPrice
        ? config.vipOfferPrice
        : DEFAULT_MEMBERSHIP_CONFIG.vipOfferPrice,
  };
}

export interface SystemeConfig {
  referralFieldSlug: string;
}

const DEFAULT_SYSTEME_CONFIG: SystemeConfig = {
  referralFieldSlug: "original_affiliate",
};

// The Systeme.io custom field that receives Registration.referredBy --
// configurable rather than hardcoded since the field's slug is specific
// to this Systeme.io account/setup, not something safe to assume for a
// future white-labeled instance.
export async function getSystemeConfig(): Promise<SystemeConfig> {
  const record = await prisma.siteConfig.findFirst();
  const config = record?.config as Record<string, unknown> | null;
  return {
    referralFieldSlug:
      typeof config?.systemeReferralFieldSlug === "string" && config.systemeReferralFieldSlug
        ? config.systemeReferralFieldSlug
        : DEFAULT_SYSTEME_CONFIG.referralFieldSlug,
  };
}

// Default copy for the Sales/Home/VIP-offer pages embeds a price as a
// "{price}" token instead of a hardcoded value -- this is the one place
// that token gets resolved, so every place it appears stays in sync with
// a single admin-edited field.
export function interpolatePrice(text: string, priceLabel: string): string {
  return text.replace(/\{price\}/g, priceLabel);
}
