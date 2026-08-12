// Shared by every admin-editable page-config module (registerPageConfig,
// salesPageConfig, homePageConfig): layers a partial SiteConfig JSON blob
// over hardcoded defaults, key by key, so a config row that's missing a
// field entirely (new field added after the row was first saved) or has a
// stale/malformed value for a field falls back to the default instead of
// producing undefined/garbage. Arrays are replaced wholesale rather than
// merged element-by-element -- callers that store lists (FAQ items,
// testimonial slots) always write back the full array on save, so partial
// array merging isn't a case that occurs.
export function deepMerge<T>(defaults: T, overrides: unknown): T {
  if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) {
    return defaults;
  }
  const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const key of Object.keys(defaults as Record<string, unknown>)) {
    const defaultValue = (defaults as Record<string, unknown>)[key];
    const overrideValue = (overrides as Record<string, unknown>)[key];
    if (overrideValue === undefined) continue;
    if (typeof defaultValue === "object" && defaultValue !== null && !Array.isArray(defaultValue)) {
      result[key] = deepMerge(defaultValue, overrideValue);
    } else if (typeof overrideValue === typeof defaultValue) {
      result[key] = overrideValue;
    }
  }
  return result as T;
}
