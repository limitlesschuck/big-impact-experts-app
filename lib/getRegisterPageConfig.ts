import { prisma } from "@/lib/prisma";
import {
  DEFAULT_REGISTER_PAGE_CONFIG,
  deepMerge,
  type RegisterPageConfig,
} from "@/lib/registerPageConfig";

export async function getRegisterPageConfig(): Promise<RegisterPageConfig> {
  const record = await prisma.siteConfig.findFirst();
  const stored = (record?.config as Record<string, unknown> | null)?.registerPage;
  return deepMerge(DEFAULT_REGISTER_PAGE_CONFIG, stored);
}
