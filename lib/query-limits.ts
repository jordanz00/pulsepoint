/**
 * Query take limits — cap list/export sizes for scale and abuse resistance.
 *
 * WHO: Server components and actions that call findMany without pagination UI
 * WHAT: Enforces maximum row counts per context (admin lists, dashboards, exports)
 */

/** Default cap for admin tables with virtual scroll / pagination. */
export const DEFAULT_ADMIN_LIST_CAP = 500;

/** Dashboards and KPI surfaces — smaller caps keep TTFB predictable. */
export const DEFAULT_DASHBOARD_LIST_CAP = 100;

/** Advocacy issue/campaign lists on a single page. */
export const ADVOCACY_LIST_CAP = 50;

export class QueryTakeCapError extends Error {
  constructor(context: string, requested: number, max: number) {
    super(`QUERY_TAKE_CAP:${context}:${requested}>${max}`);
    this.name = "QueryTakeCapError";
  }
}

/**
 * Returns a safe `take` for Prisma findMany — never exceeds max.
 */
export function clampTake(
  requested: number | undefined,
  max: number,
  context: string,
): number {
  const take = requested ?? max;
  if (!Number.isFinite(take) || take < 1) {
    throw new QueryTakeCapError(context, take, max);
  }
  if (take > max) {
    throw new QueryTakeCapError(context, take, max);
  }
  return Math.floor(take);
}
