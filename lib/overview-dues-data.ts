/**
 * AMS home dashboard — dues invoices, renewal tracking, membership class split.
 * All counts from live org data (no invented numbers).
 */

import { getOrgDb } from "@/lib/db";
import {
  membershipClassFromTierName,
  type MembershipClass,
} from "@/lib/membership-class";

export type UnpaidDuesInvoiceRow = {
  orderId: string;
  memberId: string | null;
  memberName: string;
  productName: string;
  totalCents: number;
  createdAt: Date;
  status: "PENDING";
};

export type RenewalTrackingRow = {
  memberId: string;
  memberName: string;
  tierName: string | null;
  membershipClass: MembershipClass;
  renewalDueAt: Date;
  daysUntilDue: number;
  state: "overdue" | "due_soon";
};

export type MembershipClassSplit = {
  general: number;
  associate: number;
  other: number;
  total: number;
  generalPct: number;
  associatePct: number;
};

export type OverviewDuesSnapshot = {
  dataAsOf: Date;
  unpaidInvoiceCount: number;
  unpaidInvoiceCents: number;
  renewalOverdue: number;
  renewalDue30: number;
  membershipSplit: MembershipClassSplit;
  unpaidInvoices: UnpaidDuesInvoiceRow[];
  renewalQueue: RenewalTrackingRow[];
};

function daysUntil(d: Date, from: Date): number {
  return Math.ceil((d.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export async function loadOverviewDuesSnapshot(orgId: string): Promise<OverviewDuesSnapshot> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);

  const [
    pendingOrders,
    renewalOverdue,
    renewalDue30,
    activeMembers,
    renewalMembers,
  ] = await Promise.all([
    db.commerceOrder.findMany({
      where: {
        orgId,
        status: "PENDING",
        items: { some: { product: { kind: "DUES" } } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: { product: { select: { name: true, kind: true } } },
        },
      },
    }),
    db.member.count({
      where: {
        orgId,
        status: "ACTIVE",
        renewalDueAt: { lt: now, not: null },
      },
    }),
    db.member.count({
      where: {
        orgId,
        status: "ACTIVE",
        renewalDueAt: { gte: now, lte: in30 },
      },
    }),
    db.member.findMany({
      where: { orgId, status: "ACTIVE" },
      select: { tier: { select: { name: true } } },
    }),
    db.member.findMany({
      where: {
        orgId,
        status: "ACTIVE",
        renewalDueAt: { not: null, lte: in30 },
      },
      orderBy: { renewalDueAt: "asc" },
      take: 10,
      include: { tier: { select: { name: true } } },
    }),
  ]);

  const split: MembershipClassSplit = {
    general: 0,
    associate: 0,
    other: 0,
    total: activeMembers.length,
    generalPct: 0,
    associatePct: 0,
  };

  for (const m of activeMembers) {
    const cls = membershipClassFromTierName(m.tier?.name);
    split[cls] += 1;
  }

  if (split.total > 0) {
    split.generalPct = Math.round((split.general / split.total) * 100);
    split.associatePct = Math.round((split.associate / split.total) * 100);
  }

  const unpaidInvoices: UnpaidDuesInvoiceRow[] = pendingOrders.map((o) => {
    const duesItem = o.items.find((i) => i.product.kind === "DUES");
    const name = o.member
      ? `${o.member.firstName} ${o.member.lastName}`.trim()
      : "Guest checkout";
    return {
      orderId: o.id,
      memberId: o.member?.id ?? null,
      memberName: name,
      productName: duesItem?.product.name ?? "Membership dues",
      totalCents: o.totalCents,
      createdAt: o.createdAt,
      status: "PENDING",
    };
  });

  let unpaidInvoiceCents = 0;
  const unpaidAgg = await db.commerceOrder.aggregate({
    where: {
      orgId,
      status: "PENDING",
      items: { some: { product: { kind: "DUES" } } },
    },
    _sum: { totalCents: true },
    _count: { _all: true },
  });
  unpaidInvoiceCents = unpaidAgg._sum.totalCents ?? 0;
  const unpaidInvoiceCount = unpaidAgg._count._all ?? 0;

  const renewalQueue: RenewalTrackingRow[] = renewalMembers.map((m) => {
    const due = m.renewalDueAt!;
    const days = daysUntil(due, now);
    return {
      memberId: m.id,
      memberName: `${m.firstName} ${m.lastName}`.trim(),
      tierName: m.tier?.name ?? null,
      membershipClass: membershipClassFromTierName(m.tier?.name),
      renewalDueAt: due,
      daysUntilDue: days,
      state: days < 0 ? "overdue" : "due_soon",
    };
  });

  return {
    dataAsOf: now,
    unpaidInvoiceCount,
    unpaidInvoiceCents,
    renewalOverdue,
    renewalDue30,
    membershipSplit: split,
    unpaidInvoices,
    renewalQueue,
  };
}
