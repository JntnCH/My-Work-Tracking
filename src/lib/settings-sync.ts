export function normalizeCategoryNames(values: readonly unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const name = String(value ?? "").trim();
    const key = name.toLocaleLowerCase("th-TH");
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}

export type InitialCategorySources = {
  remote: readonly unknown[];
  sheet: readonly unknown[];
  local: readonly unknown[];
  fallback: readonly unknown[];
};

/**
 * Selects the first non-empty category source without allowing stale local data
 * to override data already stored for the account.
 */
export function chooseInitialCategories(sources: InitialCategorySources): string[] {
  for (const source of [sources.remote, sources.sheet, sources.local, sources.fallback]) {
    const normalized = normalizeCategoryNames(source);
    if (normalized.length > 0) return normalized;
  }
  return [];
}
