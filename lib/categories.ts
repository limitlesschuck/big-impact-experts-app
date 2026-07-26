import { prisma } from "@/lib/prisma";

export interface CategoryOption {
  value: string;
  label: string;
  prose: string;
  emoji?: string;
}

interface AssessmentQuestion {
  id: string;
  storeAs?: string;
  options?: Array<{ value: string; label: string; prose?: string; emoji?: string }>;
}

interface AssessmentConfigShape {
  questions?: AssessmentQuestion[];
}

const FALLBACK_CATEGORIES: CategoryOption[] = [
  { value: "grief", label: "Grief & loss", prose: "grief and loss", emoji: "💙" },
  { value: "relationship", label: "Relationship & divorce", prose: "relationship challenges", emoji: "💔" },
  { value: "health", label: "Health & addiction", prose: "health and addiction", emoji: "🌿" },
  { value: "financial", label: "Financial hardship", prose: "financial hardship", emoji: "💪" },
  { value: "spiritual", label: "Spiritual awakening", prose: "spiritual awakening", emoji: "✨" },
  { value: "career", label: "Career & purpose", prose: "career and purpose", emoji: "🎯" },
];

/**
 * Single source of truth for crisis categories.
 * Reads the live assessment config (the "category" question's options) so that
 * editing the assessment automatically updates every category dropdown and label
 * across the entire app. Falls back to a fixed set only if no config exists yet
 * or the category question can't be found (e.g. on a brand new fork before seeding).
 */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  try {
    const record = await prisma.assessmentConfig.findFirst();
    const config = record?.config as AssessmentConfigShape | null;
    const categoryQuestion = config?.questions?.find(
      (q) => q.storeAs === "crisisCategory"
    );

    if (!categoryQuestion?.options || categoryQuestion.options.length === 0) {
      return FALLBACK_CATEGORIES;
    }

    return categoryQuestion.options.map((opt) => ({
      value: opt.value,
      label: opt.label,
      prose: opt.prose ?? opt.label.toLowerCase(),
      emoji: opt.emoji,
    }));
  } catch (err) {
    console.error("getCategoryOptions error:", err);
    return FALLBACK_CATEGORIES;
  }
}

export async function getCategoryLabelMap(): Promise<Record<string, string>> {
  const categories = await getCategoryOptions();
  return Object.fromEntries(categories.map((c) => [c.value, c.label]));
}

export async function getCategoryProseMap(): Promise<Record<string, string>> {
  const categories = await getCategoryOptions();
  return Object.fromEntries(categories.map((c) => [c.value, c.prose]));
}

export async function getCategoryValuesList(): Promise<string[]> {
  const categories = await getCategoryOptions();
  return categories.map((c) => c.value);
}
