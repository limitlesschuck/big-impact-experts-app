import { prisma } from "@/lib/prisma";
import { deepMerge } from "@/lib/deepMerge";
import { DEFAULT_SALES_PAGE_CONFIG, type SalesPageConfig } from "@/lib/salesPageConfig";

export async function getSalesPageConfig(): Promise<SalesPageConfig> {
  const record = await prisma.siteConfig.findFirst();
  const stored = (record?.config as Record<string, unknown> | null)?.salesPage;
  return deepMerge(DEFAULT_SALES_PAGE_CONFIG, stored);
}
