import { prisma } from "@/lib/prisma";

export interface MembershipConfig {
  checkoutUrl: string;
  priceLabel: string;
}

const DEFAULT_MEMBERSHIP_CONFIG: MembershipConfig = {
  checkoutUrl: "https://go.bigimpactexperts.com/join",
  priceLabel: "$39/mo",
};

// Flat top-level SiteConfig keys (peers of episodeCardImage/defaultHost),
// not namespaced under a page config -- the price and checkout link are
// referenced from copy on both the Sales and Home pages via the {price}
// token (see interpolatePrice below), so they live independently of
// either page's own config object.
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
  };
}

// Default copy for the Sales/Home pages embeds the membership price as a
// "{price}" token instead of a hardcoded "$39/mo" -- this is the one place
// that token gets resolved, so every place it appears stays in sync with a
// single admin-edited field.
export function interpolatePrice(text: string, priceLabel: string): string {
  return text.replace(/\{price\}/g, priceLabel);
}
