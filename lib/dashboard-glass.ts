/**
 * Dashboard glass UI helpers — activity classification, relative time, period deltas.
 * Values come from org DB; deltas compare last 30 days vs prior 30 days.
 */

import { getOrgDb } from "@/lib/db";

export type ActivityKind = "member" | "import" | "exception";

export type PeriodDelta = {
  label: string;
  direction: "up" | "down" | "flat";
};

/** Purple = member actions, green = import/export, red = failures. */
export function classifyAuditAction(action: string): ActivityKind {
  const a = action.toLowerCase();
  if (
    a.includes("fail") ||
    a.includes("error") ||
    a.includes("reject") ||
    a.includes("void") ||
    a.includes("exception")
  ) {
    return "exception";
  }
  if (
    a.includes("import") ||
    a.includes("export") ||
    a.includes("bulk") ||
    a.includes("sync") ||
    a.includes("upload")
  ) {
    return "import";
  }
  return "member";
}

export function formatPeriodDelta(current: number, prior: number): PeriodDelta | null {
  if (current === 0 && prior === 0) return null;
  if (prior === 0) {
    return current > 0
      ? { label: "New vs prior 30d", direction: "up" }
      : { label: "No change vs prior 30d", direction: "flat" };
  }
  const pct = ((current - prior) / prior) * 100;
  const rounded = Math.abs(pct) < 0.05 ? 0 : Math.round(pct * 10) / 10;
  if (rounded === 0) {
    return { label: "No change vs prior 30d", direction: "flat" };
  }
  const sign = rounded > 0 ? "+" : "";
  return {
    label: `${sign}${rounded}% vs prior 30d`,
    direction: rounded > 0 ? "up" : "down",
  };
}

export function formatRelativeTime(date: Date, now = new Date()): string {
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 45) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type DashboardPeriodDeltas = {
  revenue: PeriodDelta | null;
  members: PeriodDelta | null;
  nonDuesShare: PeriodDelta | null;
  events: PeriodDelta | null;
  /** Members who joined in last 30 days vs prior 30 days */
  membersJoinedRecent: number;
  membersJoinedPrior: number;
};

export async function loadDashboardPeriodDeltas(orgId: string): Promise<DashboardPeriodDeltas> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const d60 = new Date(now.getTime() - 60 * 86400000);

  const [
    revRecent,
    revPrior,
    membersRecent,
    membersPrior,
    eventsRecent,
    eventsPrior,
    recentPaid,
    priorPaid,
  ] = await Promise.all([
    db.commerceOrder.aggregate({
      where: { orgId, status: "PAID", paidAt: { gte: d30 } },
      _sum: { totalCents: true },
    }),
    db.commerceOrder.aggregate({
      where: { orgId, status: "PAID", paidAt: { gte: d60, lt: d30 } },
      _sum: { totalCents: true },
    }),
    db.member.count({ where: { joinedAt: { gte: d30 } } }),
    db.member.count({ where: { joinedAt: { gte: d60, lt: d30 } } }),
    db.event.count({ where: { status: "PUBLISHED", createdAt: { gte: d30 } } }),
    db.event.count({ where: { status: "PUBLISHED", createdAt: { gte: d60, lt: d30 } } }),
    db.commerceOrder.findMany({
      where: { orgId, status: "PAID", paidAt: { gte: d30 } },
      include: { items: { include: { product: true } } },
    }),
    db.commerceOrder.findMany({
      where: { orgId, status: "PAID", paidAt: { gte: d60, lt: d30 } },
      include: { items: { include: { product: true } } },
    }),
  ]);

  const nonDuesShareRecent = shareNonDues(recentPaid);
  const nonDuesSharePrior = shareNonDues(priorPaid);
  const shareDelta =
    nonDuesSharePrior === null || nonDuesShareRecent === null
      ? null
      : formatSharePointDelta(nonDuesShareRecent, nonDuesSharePrior);

  return {
    revenue: formatPeriodDelta(revRecent._sum.totalCents ?? 0, revPrior._sum.totalCents ?? 0),
    members: formatPeriodDelta(membersRecent, membersPrior),
    nonDuesShare: shareDelta,
    events: formatPeriodDelta(eventsRecent, eventsPrior),
    membersJoinedRecent: membersRecent,
    membersJoinedPrior: membersPrior,
  };
}

function shareNonDues(
  orders: { items: { priceCents: number; quantity: number; product: { kind: string } }[] }[],
): number | null {
  let total = 0;
  let nonDues = 0;
  for (const order of orders) {
    for (const item of order.items) {
      const line = item.priceCents * item.quantity;
      total += line;
      if (item.product.kind !== "DUES") nonDues += line;
    }
  }
  if (total === 0) return null;
  return Math.round((nonDues / total) * 100);
}

function formatSharePointDelta(current: number, prior: number): PeriodDelta {
  const diff = current - prior;
  if (diff === 0) {
    return { label: "No change vs prior 30d", direction: "flat" };
  }
  const sign = diff > 0 ? "+" : "";
  return {
    label: `${sign}${diff} pts vs prior 30d`,
    direction: diff > 0 ? "up" : "down",
  };
}
