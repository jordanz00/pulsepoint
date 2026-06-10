/**
 * Live stats for Flagship 5 showcase — tenant-scoped, no invented numbers.
 * Loads only the queries Flagship 5 needs (avoids Quake mission-control bootstrap).
 */

import { cache } from "react";
import { getOrgDb } from "@/lib/db";
import { loadHospitalAssociationSnapshot } from "@/lib/hospital-association-snapshot";
import { loadCeoCommandCenter } from "@/lib/ceo-command-center-data";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { loadAdvocacyDashboardStats } from "@/lib/advocacy-dashboard";
import { leadershipLoopTotalMinutes } from "@/lib/leadership-loop";
import type { FlagshipFeatureStat } from "@/lib/flagship-features";

export type FlagshipFeatureStats = Record<string, FlagshipFeatureStat>;

function fmtUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export const loadFlagshipFeatureStats = cache(
  async (orgId: string, orgSlug: string, orgName: string): Promise<FlagshipFeatureStats> => {
    const db = getOrgDb(orgId);

    const [
      ceo,
      executive,
      ha,
      advocacy,
      atRiskCount,
      memberCount,
      importBatchCount,
      insightSnapshots,
      spotlightMember,
    ] = await Promise.all([
      loadCeoCommandCenter(orgId, orgSlug, orgName),
      loadExecutiveDashboard(orgId),
      loadHospitalAssociationSnapshot(orgId),
      loadAdvocacyDashboardStats(orgId),
      db.member.count({
        where: { orgId, status: "ACTIVE", engagementTier: { in: ["at_risk", "inactive"] } },
      }),
      db.member.count({ where: { orgId, status: "ACTIVE" } }),
      db.memberImportBatch.count({ where: { orgId } }),
      db.insightsSnapshot.count({ where: { orgId } }),
      db.member.findFirst({
        where: { orgId, status: "ACTIVE" },
        orderBy: { engagementScore: "desc" },
        select: { id: true, firstName: true, lastName: true, engagementScore: true },
      }),
    ]);

    const member360Path = spotlightMember ? `/members/${spotlightMember.id}` : "/members";
    const member360Label = spotlightMember
      ? `${spotlightMember.firstName} ${spotlightMember.lastName}`
      : "Top member";

    return {
      "executive-command": {
        value: fmtUsd(ceo.revenue.mtdCents),
        label: "revenue MTD",
        secondary: [
          { value: String(leadershipLoopTotalMinutes()), label: "min scripted path" },
        ],
      },
      "membership-intelligence": {
        value: String(atRiskCount),
        label: "at-risk members",
        secondary: spotlightMember
          ? [{ value: String(spotlightMember.engagementScore), label: member360Label }]
          : undefined,
        pathOverride: member360Path,
      },
      "advocacy-one-roster": {
        value: String(advocacy.membersOnHospitalRoster),
        label: "on hospital roster",
        secondary: [
          { value: String(advocacy.hospitalAccounts), label: "hospital accounts" },
          { value: String(ha.activeAdvocacyIssues), label: "active issues" },
        ],
      },
      "board-briefing-pack": {
        value: String(insightSnapshots),
        label: "snapshots saved",
        secondary: [{ value: fmtUsd(executive.totalRevenueCents), label: "total revenue" }],
      },
      "migration-honest": {
        value: String(importBatchCount),
        label: "import batches",
        secondary: [{ value: String(memberCount), label: "active members" }],
      },
    };
  },
);
