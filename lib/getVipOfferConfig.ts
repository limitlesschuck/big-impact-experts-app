import { prisma } from "@/lib/prisma";
import { deepMerge } from "@/lib/deepMerge";
import { DEFAULT_VIP_OFFER_CONFIG, type VipOfferConfig } from "@/lib/vipOfferConfig";

export async function getVipOfferConfig(): Promise<VipOfferConfig> {
  const record = await prisma.siteConfig.findFirst();
  const stored = (record?.config as Record<string, unknown> | null)?.vipOffer;
  return deepMerge(DEFAULT_VIP_OFFER_CONFIG, stored);
}
