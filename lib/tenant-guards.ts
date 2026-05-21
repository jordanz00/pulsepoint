/**
 * Runtime tenant guards — fail closed if a member list/export crosses org boundaries.
 *
 * WHO: Any code path that returns Member[] to staff or CSV export
 * WHAT: Throws TENANT_LEAK before data leaves the server
 */

export class TenantLeakError extends Error {
  constructor(context: string) {
    super(`TENANT_LEAK:${context}`);
    this.name = "TenantLeakError";
  }
}

/** Max rows returned in a single member list/export (abuse + blast-radius cap). */
export const MAX_MEMBER_LIST_ROWS = 500;

export type OrgScopedRow = { orgId: string };

/**
 * Defense-in-depth: every row must match the orgId used for getOrgDb().
 */
export function assertAllRowsBelongToOrg<T extends OrgScopedRow>(
  rows: T[],
  orgId: string,
  context: string,
): void {
  if (!orgId) {
    throw new TenantLeakError(`${context}:missing_orgId`);
  }
  for (const row of rows) {
    if (row.orgId !== orgId) {
      throw new TenantLeakError(`${context}:row_org_mismatch`);
    }
  }
}

export function capMemberListRows<T>(rows: T[], context: string): T[] {
  if (rows.length > MAX_MEMBER_LIST_ROWS) {
    throw new Error(`MEMBER_LIST_CAP_EXCEEDED:${context}:${rows.length}`);
  }
  return rows;
}
