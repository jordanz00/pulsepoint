/**
 * Cursor pagination helpers — use with getOrgDb(orgId) list actions.
 */

export const PAGE_SIZE = 50;

export const EXPORT_BATCH_SIZE = 1000;

export const IMPORT_BATCH_SIZE = 500;

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
}

export function buildCursorQuery(cursor?: string) {
  return cursor ? { cursor: { id: cursor }, skip: 1 } : {};
}

/**
 * Slice a page when fetching take+1 rows to detect a next page.
 */
export function paginateSlice<T extends { id: string }>(
  rows: T[],
  take: number = PAGE_SIZE,
): { items: T[]; nextCursor: string | null } {
  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;
  return { items, nextCursor };
}
