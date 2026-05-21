/**
 * Tenant query scoping helpers — used by getOrgDb() and unit tests.
 *
 * WHO: Platform engineers proving org isolation
 * WHAT: Merges orgId into Prisma where/create payloads for tenant tables
 */

export function mergeWhere<T extends { where?: unknown }>(
  args: T,
  orgId: string,
): T {
  const existing = (args.where ?? {}) as Record<string, unknown>;
  return {
    ...args,
    where: { ...existing, orgId },
  };
}

export function mergeCreateData<T extends { data?: unknown }>(
  args: T,
  orgId: string,
): T {
  const data = args.data;
  if (!data || typeof data !== "object") {
    return args;
  }
  if (Array.isArray(data)) {
    return {
      ...args,
      data: data.map((row) =>
        typeof row === "object" && row !== null
          ? { ...row, orgId }
          : row,
      ),
    };
  }
  return {
    ...args,
    data: { ...(data as Record<string, unknown>), orgId },
  };
}
