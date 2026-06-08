/**
 * Sidebar badge counts — org-scoped via getOrgDb only.
 */

import { getOrgDb } from "@/lib/db";

export type AdminNavCounts = {
  members: number;
  events: number;
  exceptions: number;
};

export async function getAdminNavCounts(orgId: string): Promise<AdminNavCounts> {
  const db = getOrgDb(orgId);

  const [members, events, exceptions] = await Promise.all([
    db.member.count({ where: { status: "ACTIVE" } }),
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.automationException.count({ where: { resolvedAt: null } }),
  ]);

  return { members, events, exceptions };
}
