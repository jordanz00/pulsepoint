/**
 * Enterprise health system governance — parent-child hospital hierarchy + governance rollups.
 *
 * WHO: Hospital association staff managing multi-hospital health systems.
 * WHAT: Builds health-system trees from MemberOrganization.parentId; counts governance roles.
 * HOW IT CONNECTS: Enterprise AMS hub, command center, membership analytics.
 */

import { getOrgDb } from "@/lib/db";

export type HealthSystemTreeNode = {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  childCount: number;
  children: HealthSystemTreeNode[];
};

export type OrphanHospital = {
  id: string;
  name: string;
  type: string;
  memberCount: number;
};

export type HealthSystemGovernanceSummary = {
  asOf: string;
  healthSystems: number;
  hospitals: number;
  unlinkedHospitals: number;
  totalMembersOnRoster: number;
  governanceRoleCount: number;
  activeCommittees: number;
  cSuiteOnRoster: number;
};

export type HealthSystemGovernanceData = {
  summary: HealthSystemGovernanceSummary;
  trees: HealthSystemTreeNode[];
  orphanHospitals: OrphanHospital[];
};

type OrgRow = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  memberCount: number;
  childCount: number;
};

const SYSTEM_TYPES = new Set(["HEALTH_SYSTEM", "HEALTH_NETWORK"]);

/**
 * Build nested trees from flat org rows (roots = no parent + system type, or explicit roots).
 */
export function buildHealthSystemTrees(rows: OrgRow[]): {
  trees: HealthSystemTreeNode[];
  orphanHospitals: OrphanHospital[];
} {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const childrenByParent = new Map<string, OrgRow[]>();

  for (const row of rows) {
    if (!row.parentId) continue;
    const list = childrenByParent.get(row.parentId) ?? [];
    list.push(row);
    childrenByParent.set(row.parentId, list);
  }

  function toNode(row: OrgRow): HealthSystemTreeNode {
    const kids = (childrenByParent.get(row.id) ?? []).sort((a, b) => a.name.localeCompare(b.name));
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      memberCount: row.memberCount,
      childCount: row.childCount,
      children: kids.map(toNode),
    };
  }

  const roots = rows
    .filter((r) => !r.parentId && SYSTEM_TYPES.has(r.type))
    .sort((a, b) => a.name.localeCompare(b.name));

  const orphanHospitals = rows
    .filter((r) => !r.parentId && !SYSTEM_TYPES.has(r.type))
    .map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      memberCount: r.memberCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    trees: roots.map(toNode),
    orphanHospitals,
  };
}

export async function loadHealthSystemGovernance(orgId: string): Promise<HealthSystemGovernanceData> {
  const db = getOrgDb(orgId);

  const [accounts, governanceRoleCount, activeCommittees, cSuiteOnRoster, rosterMembers] =
    await Promise.all([
      db.memberOrganization.findMany({
        where: { orgId },
        select: {
          id: true,
          name: true,
          type: true,
          parentId: true,
          _count: { select: { members: true, children: true } },
        },
        orderBy: { name: "asc" },
        take: 500,
      }),
      db.memberRole.count({
        where: {
          orgId,
          isCurrent: true,
          category: { in: ["EXECUTIVE", "BOARD", "COMMITTEE"] },
        },
      }),
      db.committee.count({ where: { orgId, isActive: true } }),
      db.memberRole.count({
        where: {
          orgId,
          isCurrent: true,
          leadershipLevel: "C_SUITE",
        },
      }),
      db.member.count({
        where: { orgId, organizationAccountId: { not: null } },
      }),
    ]);

  const rows: OrgRow[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    parentId: a.parentId,
    memberCount: a._count.members,
    childCount: a._count.children,
  }));

  const { trees, orphanHospitals } = buildHealthSystemTrees(rows);

  const healthSystems = accounts.filter((a) => SYSTEM_TYPES.has(a.type)).length;
  const hospitals = accounts.filter((a) => !SYSTEM_TYPES.has(a.type)).length;

  return {
    summary: {
      asOf: new Date().toISOString().slice(0, 10),
      healthSystems,
      hospitals,
      unlinkedHospitals: orphanHospitals.length,
      totalMembersOnRoster: rosterMembers,
      governanceRoleCount,
      activeCommittees,
      cSuiteOnRoster,
    },
    trees,
    orphanHospitals,
  };
}
