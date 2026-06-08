/**
 * Member 360° profile — unified timeline from registrations, commerce, giving, CE, email.
 *
 * WHO THIS IS FOR: Staff CRM on member detail pages.
 * WHAT IT DOES: Aggregates cross-module activity into one chronological feed.
 * HOW IT CONNECTS: getOrgDb(), member detail page, portal preview.
 */

import { getOrgDb } from "@/lib/db";
import { registrationPaidAmountCents } from "@/lib/events/registration-revenue";
import {
  badgesForScore,
  scoreFromSignals,
  type EngagementTier,
} from "@/lib/engagement-score";

export type Member360ActivityKind =
  | "event"
  | "commerce"
  | "giving"
  | "learn"
  | "email"
  | "note";

export type Member360Activity = {
  id: string;
  at: Date;
  kind: Member360ActivityKind;
  title: string;
  detail: string;
  amountCents?: number;
  /** Staff admin link to source record when available */
  href?: string;
};

export type Member360Profile = {
  memberId: string;
  engagementScore: number;
  engagementTier: EngagementTier;
  badges: { code: string; label: string }[];
  renewalDueAt: Date | null;
  tierName: string | null;
  activities: Member360Activity[];
  totals: {
    events: number;
    orders: number;
    donationsCents: number;
    ceCredits: number;
  };
};

export async function loadMember360(
  orgId: string,
  memberId: string,
  orgSlug?: string,
): Promise<Member360Profile | null> {
  const db = getOrgDb(orgId);
  const member = await db.member.findFirst({
    where: { id: memberId },
    include: { tier: true },
  });
  if (!member) return null;

  const email = member.email?.toLowerCase() ?? null;

  const [
    registrations,
    orders,
    donations,
    ceAwards,
    completions,
    emailSends,
    notes,
  ] = await Promise.all([
    db.eventRegistration.findMany({
      where: { memberId },
      include: {
        event: true,
        ticketType: { select: { priceCents: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.commerceOrder.findMany({
      where: { memberId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.donation.findMany({
      where: { memberId },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.cECreditAward.findMany({
      where: { memberId },
      include: { creditType: true },
      orderBy: { awardedAt: "desc" },
      take: 30,
    }),
    db.courseEnrollment.findMany({
      where: { memberId, status: "COMPLETED" },
      include: { course: true },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
    email
      ? db.emailSendLog.findMany({
          where: { orgId, recipient: email },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : Promise.resolve([]),
    db.memberNote.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const daysUntilRenewal = member.renewalDueAt
    ? Math.ceil((member.renewalDueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const { score, tier } = scoreFromSignals({
    eventRegistrations: registrations.length,
    paidEventRegistrations: registrations.filter((r) => r.paidAt).length,
    commerceOrders: orders.length,
    paidCommerceOrders: orders.filter((o) => o.status === "PAID").length,
    donations: donations.length,
    ceCredits: ceAwards.reduce((n, a) => n + a.amount, 0),
    courseCompletions: completions.length,
    emailSends: emailSends.length,
    daysSinceJoin: Math.ceil((Date.now() - member.joinedAt.getTime()) / (1000 * 60 * 60 * 24)),
    daysUntilRenewal,
    status: member.status,
  });

  const activities: Member360Activity[] = [];

  const slugPrefix = orgSlug ? `/${orgSlug}` : "";

  for (const r of registrations) {
    activities.push({
      id: `reg-${r.id}`,
      at: r.createdAt,
      kind: "event",
      title: r.event.title,
      detail: r.checkedInAt ? "Checked in" : r.paidAt ? "Registered · Paid" : `Registered · ${r.status}`,
      amountCents: registrationPaidAmountCents({
        paidAt: r.paidAt,
        ticketType: r.ticketType,
        event: r.event,
      }) || undefined,
      href: slugPrefix ? `${slugPrefix}/events/${r.eventId}` : undefined,
    });
  }
  for (const o of orders) {
    activities.push({
      id: `ord-${o.id}`,
      at: o.createdAt,
      kind: "commerce",
      title: o.items.map((i) => i.product.name).join(", ") || "Order",
      detail: o.status === "PAID" ? "Paid" : o.status,
      amountCents: o.totalCents,
      href: slugPrefix ? `${slugPrefix}/commerce` : undefined,
    });
  }
  for (const d of donations) {
    activities.push({
      id: `don-${d.id}`,
      at: d.createdAt,
      kind: "giving",
      title: d.campaign.name,
      detail: d.recurring ? "Recurring gift" : "One-time gift",
      amountCents: d.amountCents,
      href: slugPrefix ? `${slugPrefix}/giving` : undefined,
    });
  }
  for (const a of ceAwards) {
    activities.push({
      id: `ce-${a.id}`,
      at: a.awardedAt,
      kind: "learn",
      title: `${a.amount} ${a.creditType.code} credits`,
      detail: a.note || a.source,
      href: slugPrefix ? `${slugPrefix}/learn` : undefined,
    });
  }
  for (const e of emailSends) {
    activities.push({
      id: `em-${e.id}`,
      at: e.createdAt,
      kind: "email",
      title: e.subject,
      detail: e.result,
    });
  }
  for (const n of notes) {
    activities.push({
      id: `note-${n.id}`,
      at: n.createdAt,
      kind: "note",
      title: "Staff note",
      detail: n.body.length > 120 ? `${n.body.slice(0, 117)}…` : n.body,
    });
  }

  activities.sort((a, b) => b.at.getTime() - a.at.getTime());

  return {
    memberId,
    engagementScore: score,
    engagementTier: tier,
    badges: badgesForScore(score),
    renewalDueAt: member.renewalDueAt,
    tierName: member.tier?.name ?? null,
    activities: activities.slice(0, 40),
    totals: {
      events: registrations.length,
      orders: orders.filter((o) => o.status === "PAID").length,
      donationsCents: donations.reduce((s, d) => s + d.amountCents, 0),
      ceCredits: ceAwards.reduce((n, a) => n + a.amount, 0),
    },
  };
}
