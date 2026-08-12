import { prisma } from "@/lib/prisma";
import { deepMerge } from "@/lib/deepMerge";
import { DEFAULT_HOME_PAGE_CONFIG, type HomePageConfig } from "@/lib/homePageConfig";

export async function getHomePageConfig(): Promise<HomePageConfig> {
  const record = await prisma.siteConfig.findFirst();
  const stored = (record?.config as Record<string, unknown> | null)?.homePage;
  return deepMerge(DEFAULT_HOME_PAGE_CONFIG, stored);
}
