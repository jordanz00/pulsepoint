/**
 * Executive metrics — revenue-first KPIs from live org data (no invented numbers).
 * Used on Home and Insights; all values computed from Commerce, Giving, Events, Members.
 */

import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { sumRegistrationRevenueCents } from "@/lib/events/registration-revenue";
import { classifyAuditAction, type ActivityKind } from "@/lib/dashboard-glass";

export type MetricUnit = "usd" | "count";

export type ExecutiveKpi = {
  id: string;
  label: string;
  value: number;
  unit: MetricUnit;
  emphasis: "primary" | "secondary";
  group: "revenue" | "members" | "events";
};

export type RevenueLine = {
  id: string;
  label: string;
  amountCents: number;
};

export type AuditLine = {
  id: string;
  summary: string;
  when: Date;
  action: string;
  kind: ActivityKind;
};

export type ExecutiveDashboard = {
  kpis: ExecutiveKpi[];
  revenueLines: RevenueLine[];
  totalRevenueCents: number;
  duesRevenueCents: number;
  nonDuesRevenueCents: number;
  auditTrail: AuditLine[];
  dataAsOf: Date;
};

function auditSummary(action: string, entity: string): string {
  const table: Record<string, string> = {
    "organization.created": "Organization profile saved",
    "member.exported": "Member directory exported",
    "member.created": "New member record added",
    "member.updated": "Member profile updated",
    "event.created": "Event published to catalog",
    "event.updated": "Event details updated",
    "commerce.order.paid": "Commerce payment recorded",
    "donation.recorded": "Gift recorded on member",
    "registration.confirmed": "Event registration confirmed",
  };
  return table[action] ?? `${entity} · ${action.replace(/\./g, " ")}`;
}

export async function loadExecutiveDashboard(orgId: string): Promise<ExecutiveDashboard> {
  const db = getOrgDb(orgId);

  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);

  const [
    activeMembers,
    lapsedMembers,
    atRiskMembers,
    renewalDue30,
    hospitalAccounts,
    publishedEvents,
    registrationCount,
    paidOrders,
    donationsAgg,
    paidRegistrations,
    auditRows,
  ] = await Promise.all([
    db.member.count({ where: { status: "ACTIVE" } }),
    db.member.count({ where: { status: "LAPSED" } }),
    db.member.count({ where: { engagementTier: "at_risk" } }),
    db.member.count({
      where: { status: "ACTIVE", renewalDueAt: { gte: now, lte: in30 } },
    }),
    db.memberOrganization.count({ where: { orgId } }),
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.eventRegistration.count({ where: { status: "CONFIRMED" } }),
    db.commerceOrder.findMany({
      where: { orgId, status: "PAID" },
      include: { items: { include: { product: true } } },
    }),
    db.donation.aggregate({ _sum: { amountCents: true } }),
    db.eventRegistration.findMany({
      where: { orgId, status: "CONFIRMED", paidAt: { not: null } },
      include: {
        event: { select: { priceCents: true, title: true } },
        ticketType: { select: { priceCents: true } },
      },
    }),
    prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  let duesRevenueCents = 0;
  let merchCents = 0;
  let sponsorCents = 0;
  let otherCommerceCents = 0;

  for (const order of paidOrders) {
    for (const item of order.items) {
      const line = item.priceCents * item.quantity;
      switch (item.product.kind) {
        case "DUES":
          duesRevenueCents += line;
          break;
        case "MERCHANDISE":
          merchCents += line;
          break;
        case "SPONSORSHIP":
          sponsorCents += line;
          break;
        default:
          otherCommerceCents += line;
      }
    }
  }

  const givingCents = donationsAgg._sum.amountCents ?? 0;
  const eventRevenueCents = sumRegistrationRevenueCents(paidRegistrations);

  const nonDuesRevenueCents =
    merchCents + sponsorCents + otherCommerceCents + givingCents + eventRevenueCents;
  const totalRevenueCents = duesRevenueCents + nonDuesRevenueCents;

  const revenueLines: RevenueLine[] = [
    { id: "dues", label: "Membership dues", amountCents: duesRevenueCents },
    { id: "events", label: "Event registrations", amountCents: eventRevenueCents },
    { id: "giving", label: "Fundraising", amountCents: givingCents },
    { id: "sponsor", label: "Sponsorships", amountCents: sponsorCents },
    { id: "merch", label: "Merchandise & other", amountCents: merchCents + otherCommerceCents },
  ].filter((l) => l.amountCents > 0);

  const kpis: ExecutiveKpi[] = [
    {
      id: "revenue.total",
      label: "Total recorded revenue",
      value: totalRevenueCents / 100,
      unit: "usd",
      emphasis: "primary",
      group: "revenue",
    },
    {
      id: "revenue.dues",
      label: "Dues revenue",
      value: duesRevenueCents / 100,
      unit: "usd",
      emphasis: "primary",
      group: "revenue",
    },
    {
      id: "revenue.non_dues",
      label: "Non-dues revenue",
      value: nonDuesRevenueCents / 100,
      unit: "usd",
      emphasis: "primary",
      group: "revenue",
    },
    {
      id: "members.active",
      label: "Active members",
      value: activeMembers,
      unit: "count",
      emphasis: "secondary",
      group: "members",
    },
    {
      id: "members.at_risk",
      label: "At-risk members",
      value: atRiskMembers,
      unit: "count",
      emphasis: "secondary",
      group: "members",
    },
    {
      id: "members.lapsed",
      label: "Lapsed (win-back)",
      value: lapsedMembers,
      unit: "count",
      emphasis: "secondary",
      group: "members",
    },
    {
      id: "members.renewal_due_30",
      label: "Renewals due (30 days)",
      value: renewalDue30,
      unit: "count",
      emphasis: "secondary",
      group: "members",
    },
    {
      id: "members.hospital_accounts",
      label: "Hospital / system accounts",
      value: hospitalAccounts,
      unit: "count",
      emphasis: "secondary",
      group: "members",
    },
    {
      id: "revenue.giving",
      label: "Fundraising",
      value: givingCents / 100,
      unit: "usd",
      emphasis: "secondary",
      group: "revenue",
    },
    {
      id: "revenue.commerce",
      label: "Commerce",
      value: (merchCents + sponsorCents + otherCommerceCents) / 100,
      unit: "usd",
      emphasis: "secondary",
      group: "revenue",
    },
    {
      id: "events.registrations",
      label: "Event registrations",
      value: registrationCount,
      unit: "count",
      emphasis: "secondary",
      group: "events",
    },
    {
      id: "events.published",
      label: "Published events",
      value: publishedEvents,
      unit: "count",
      emphasis: "secondary",
      group: "events",
    },
  ];

  return {
    kpis,
    revenueLines,
    totalRevenueCents,
    duesRevenueCents,
    nonDuesRevenueCents,
    auditTrail: auditRows.map((r) => ({
      id: r.id,
      summary: auditSummary(r.action, r.entity),
      when: r.createdAt,
      action: r.action,
      kind: classifyAuditAction(r.action),
    })),
    dataAsOf: new Date(),
  };
}
