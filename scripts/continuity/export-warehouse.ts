/**
 * Warehouse bundle — $0 operational exports (CSV) for BI / IT.
 *
 * Usage:
 *   pnpm continuity:export
 *   ORG_SLUG=demo-healthcare pnpm continuity:export
 *
 * Writes backups/warehouse-<timestamp>/*.csv
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../../lib/prisma";
import { loadAdvocacyDashboardStats } from "../../lib/advocacy-dashboard";
import { loadExecutiveDashboard } from "../../lib/executive-metrics";
import { loadMembershipAnalytics } from "../../lib/membership-analytics";
import { BACKUPS_DIR, backupStamp, ensureBackupsDir } from "./_shared";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]!);
  const lines = [keys.join(",")];
  for (const row of rows) {
    lines.push(keys.map((k) => csvEscape(row[k])).join(","));
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const slug = process.env.ORG_SLUG ?? "demo-healthcare";
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) {
    console.error(`Org not found: ${slug}`);
    process.exit(1);
  }

  ensureBackupsDir();
  const dir = path.join(BACKUPS_DIR, `warehouse-${backupStamp()}`);
  fs.mkdirSync(dir, { recursive: true });

  const members = await prisma.member.findMany({
    where: { orgId: org.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      renewalDueAt: true,
      createdAt: true,
    },
  });

  const events = await prisma.event.findMany({
    where: { orgId: org.id },
    select: {
      id: true,
      title: true,
      publicSlug: true,
      status: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      priceCents: true,
    },
  });

  const registrations = await prisma.eventRegistration.findMany({
    where: { orgId: org.id },
    select: {
      id: true,
      eventId: true,
      memberId: true,
      status: true,
      paidAt: true,
      createdAt: true,
    },
  });

  const priceByEvent = new Map(events.map((e) => [e.id, e.priceCents]));
  const revenueConfirmed = registrations
    .filter((r) => r.status === "CONFIRMED")
    .reduce((sum, r) => sum + (priceByEvent.get(r.eventId) ?? 0), 0);

  const [executive, membership, advocacy] = await Promise.all([
    loadExecutiveDashboard(org.id),
    loadMembershipAnalytics(org.id),
    loadAdvocacyDashboardStats(org.id),
  ]);

  const executiveKpiRows = executive.kpis.map((k) => ({
    metricKey: k.id,
    label: k.label,
    value: k.value,
    unit: k.unit,
    emphasis: k.emphasis,
    group: k.group,
    dataAsOf: executive.dataAsOf.toISOString(),
  }));

  const membershipSummaryRows = [
    {
      metricKey: "members.active",
      label: "Active members",
      value: membership.totals.active,
      unit: "count",
    },
    {
      metricKey: "members.at_risk",
      label: "At-risk members",
      value: membership.totals.atRisk,
      unit: "count",
    },
    {
      metricKey: "members.lapsed",
      label: "Lapsed members",
      value: membership.totals.lapsed,
      unit: "count",
    },
    {
      metricKey: "members.renewal_due_30",
      label: "Renewals due (30 days)",
      value: membership.totals.renewalDue30,
      unit: "count",
    },
    {
      metricKey: "members.hospital_accounts",
      label: "Hospital accounts",
      value: membership.totals.hospitalAccounts,
      unit: "count",
    },
    {
      metricKey: "membership.retention_pct",
      label: "Retention rate (%)",
      value: membership.retentionRatePct ?? "",
      unit: "pct",
    },
    {
      metricKey: "membership.recent_joins_30",
      label: "New members (30 days)",
      value: membership.recentJoins30,
      unit: "count",
    },
  ];

  const advocacyHospitalRows = [
    {
      metricKey: "advocacy.hospital_accounts",
      label: "Hospital accounts",
      value: advocacy.hospitalAccounts,
      unit: "count",
    },
    {
      metricKey: "advocacy.members_on_hospital_roster",
      label: "Members on hospital roster",
      value: advocacy.membersOnHospitalRoster,
      unit: "count",
    },
    {
      metricKey: "advocacy.hospitals_engaged",
      label: "Hospitals engaged (MemberPulse)",
      value: advocacy.engagedHospitalAccounts,
      unit: "count",
    },
    {
      metricKey: "advocacy.hospital_engagement_pct",
      label: "Hospital engagement rate (%)",
      value: advocacy.hospitalEngagementPct,
      unit: "pct",
    },
    {
      metricKey: "advocacy.hospitals_with_take_action",
      label: "Hospitals with take-action response",
      value: advocacy.hospitalsWithTakeActionResponse,
      unit: "count",
    },
    {
      metricKey: "advocacy.take_action_responses_mtd",
      label: "Take-action responses (month)",
      value: advocacy.takeActionResponsesThisMonth,
      unit: "count",
    },
  ];

  const engagementTierRows = membership.engagementBreakdown.map((row) => ({
    tier: row.tier,
    label: row.label,
    count: row.count,
    pct: row.pct,
  }));

  const hospitalAccountRows = membership.topHospitalAccounts.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    memberCount: row.memberCount,
    region: row.region ?? "",
  }));

  fs.writeFileSync(path.join(dir, "members.csv"), toCsv(members as Record<string, unknown>[]));
  fs.writeFileSync(path.join(dir, "events.csv"), toCsv(events as Record<string, unknown>[]));
  fs.writeFileSync(
    path.join(dir, "registrations.csv"),
    toCsv(registrations as Record<string, unknown>[]),
  );
  fs.writeFileSync(path.join(dir, "fact_executive_kpi.csv"), toCsv(executiveKpiRows));
  fs.writeFileSync(path.join(dir, "fact_membership_analytics.csv"), toCsv(membershipSummaryRows));
  fs.writeFileSync(
    path.join(dir, "fact_advocacy_hospital_participation.csv"),
    toCsv(advocacyHospitalRows),
  );
  fs.writeFileSync(path.join(dir, "dim_engagement_tier.csv"), toCsv(engagementTierRows));
  fs.writeFileSync(path.join(dir, "dim_hospital_account.csv"), toCsv(hospitalAccountRows));
  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    JSON.stringify(
      {
        orgSlug: slug,
        exportedAt: new Date().toISOString(),
        memberCount: members.length,
        eventCount: events.length,
        registrationCount: registrations.length,
        confirmedRevenueCents: revenueConfirmed,
        files: [
          "members.csv",
          "events.csv",
          "registrations.csv",
          "fact_executive_kpi.csv",
          "fact_membership_analytics.csv",
          "fact_advocacy_hospital_participation.csv",
          "dim_engagement_tier.csv",
          "dim_hospital_account.csv",
        ],
        metricKeys: [
          ...executiveKpiRows.map((r) => r.metricKey),
          ...membershipSummaryRows.map((r) => r.metricKey),
          ...advocacyHospitalRows.map((r) => r.metricKey),
        ],
        note: "Import CSVs to your warehouse or BI tools when IT is ready.",
      },
      null,
      2,
    ),
  );

  console.log(`Warehouse export: ${dir}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
