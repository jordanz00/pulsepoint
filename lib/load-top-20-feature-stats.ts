/**
 * Live stats for Top 20 feature showcase — tenant-scoped, no invented numbers.
 */

import { cache } from "react";
import { getOrgDb } from "@/lib/db";
import { loadHospitalAssociationSnapshot } from "@/lib/hospital-association-snapshot";
import { loadHealthSystemGovernance } from "@/lib/enterprise/health-system-governance";
import { loadCeoCommandCenter } from "@/lib/ceo-command-center-data";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { buildOrgInsights } from "@/lib/intelligence/build-org-insights";
import { loadQuakeMissionControl } from "@/lib/quake-mission-control";
import { leadershipLoopTotalMinutes } from "@/lib/leadership-loop";
import { portfolioWalkthroughMinutes } from "@/lib/demo-walkthrough";
import type { Top20FeatureStat } from "@/lib/top-20-features";

export type Top20FeatureStats = Record<string, Top20FeatureStat>;

function fmtUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export const loadTop20FeatureStats = cache(
  async (orgId: string, orgSlug: string, orgName: string): Promise<Top20FeatureStats> => {
    const db = getOrgDb(orgId);

    const [
      ceo,
      executive,
      orgInsights,
      ha,
      governance,
      quake,
      memberCount,
      atRiskCount,
      publishedEvents,
      courseCount,
      productCount,
      templateCount,
      committeeCount,
      donationCount,
      importBatchCount,
      workflowCount,
      insightSnapshots,
      spotlightMember,
    ] = await Promise.all([
      loadCeoCommandCenter(orgId, orgSlug, orgName),
      loadExecutiveDashboard(orgId),
      buildOrgInsights(orgId, orgSlug),
      loadHospitalAssociationSnapshot(orgId),
      loadHealthSystemGovernance(orgId),
      Promise.resolve(loadQuakeMissionControl()),
      db.member.count({ where: { orgId, status: "ACTIVE" } }),
      db.member.count({
        where: { orgId, status: "ACTIVE", engagementTier: { in: ["at_risk", "inactive"] } },
      }),
      db.event.count({ where: { orgId, status: "PUBLISHED" } }),
      db.course.count({ where: { orgId } }),
      db.commerceProduct.count({ where: { orgId, active: true } }),
      db.emailTemplate.count({ where: { orgId, approved: true } }),
      db.committee.count({ where: { orgId, isActive: true } }),
      db.donation.count({ where: { orgId } }),
      db.memberImportBatch.count({ where: { orgId } }),
      db.crmWorkflow.count({ where: { orgId, active: true } }),
      db.insightsSnapshot.count({ where: { orgId } }),
      db.member.findFirst({
        where: { orgId, status: "ACTIVE" },
        orderBy: { engagementScore: "desc" },
        select: { id: true, firstName: true, lastName: true, engagementScore: true },
      }),
      db.automationException.count({ where: { orgId, resolvedAt: null } }),
    ]);

    const member360Path = spotlightMember ? `/members/${spotlightMember.id}` : "/members";
    const member360Label = spotlightMember
      ? `${spotlightMember.firstName} ${spotlightMember.lastName}`
      : "Top member";

    return {
      "leadership-loop": {
        value: String(leadershipLoopTotalMinutes()),
        label: "min scripted path",
      },
      "command-center": {
        value: fmtUsd(ceo.revenue.mtdCents),
        label: "revenue MTD",
      },
      "mission-control": {
        value: String(quake.corporation.agents),
        label: "AI agents active",
      },
      "why-pulsepoint": {
        value: String(portfolioWalkthroughMinutes()),
        label: "min portfolio script",
      },
      "advocacy-story": {
        value: String(ha.activeAdvocacyIssues),
        label: "active issues",
      },
      "learn-workforce": {
        value: String(courseCount),
        label: "courses in catalog",
      },
      "membership-analytics": {
        value: String(atRiskCount),
        label: "at-risk members",
      },
      "health-system-governance": {
        value: String(governance.summary.healthSystems),
        label: "health systems",
      },
      "board-pack": {
        value: String(insightSnapshots),
        label: "snapshots saved",
      },
      "import-staging": {
        value: String(importBatchCount),
        label: "import batches",
      },
      "events-registration": {
        value: String(publishedEvents),
        label: "published events",
      },
      "member-360": {
        value: spotlightMember ? String(spotlightMember.engagementScore) : "—",
        label: member360Label,
        pathOverride: member360Path,
      },
      "insights-board": {
        value: fmtUsd(executive.totalRevenueCents),
        label: "total revenue",
      },
      "crm-prospector": {
        value: String(workflowCount),
        label: "active workflows",
      },
      "engage-email": {
        value: String(templateCount),
        label: "approved templates",
      },
      "giving-donors": {
        value: String(donationCount),
        label: "gifts on record",
      },
      "commerce-store": {
        value: String(productCount),
        label: "active products",
      },
      "committees-governance": {
        value: String(committeeCount),
        label: "active committees",
      },
      "intelligence-briefing": {
        value: String(orgInsights.insights.length),
        label: "active insights",
      },
      "compare-protech": {
        value: String(memberCount),
        label: "active members",
      },
    };
  },
);
