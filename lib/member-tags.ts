/**
 * Member tags — stored as JSON array in DB (SQLite + Postgres compatible).
 */

export function memberTagsArray(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter((t): t is string => typeof t === "string");
}

export function memberTagsJson(tags: string[] | undefined): string[] {
  return tags ?? [];
}
