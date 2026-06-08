/**
 * MemberCore profile — aggregates membership, committees, commerce, CRM, and learning.
 */

import { getOrgDb } from "@/lib/db";
import { loadContactRecord } from "@/lib/contact-record/load-contact-record";
import { loadMember360 } from "@/lib/member-360";
import { memberTagsArray } from "@/lib/member-tags";
import { parseExtendedFields } from "@/lib/member-profile/extended-fields";
import type {
  MemberProfileCeAward,
  MemberProfileCommittee,
  MemberProfileData,
  MemberProfileEnrollment,
  MemberProfileOrder,
  MemberProfileRegistration,
  MemberProfileRosterPeer,
  MemberProfileSubscription,
} from "@/lib/member-profile/types";
import { parseMemberPulseSnapshot } from "@/lib/member-pulse/compute";
import type { MemberRoleRow } from "@/lib/member-roles";

function isGiftCertificate(productName: string, sku: string): boolean {
  const s = `${productName} ${sku}`.toLowerCase();
  return s.includes("gift") || s.includes("certificate") || s.includes("voucher");
}

function mapOrder(
  o: {
    id: string;
    status: string;
    totalCents: number;
    paidAt: Date | null;
    createdAt: Date;
    items: {
      quantity: number;
      priceCents: number;
      product: { name: string; kind: string; sku: string };
    }[];
  },
): MemberProfileOrder {
  const lines = o.items.map((i) => ({
    productName: i.product.name,
    kind: i.product.kind,
    quantity: i.quantity,
    priceCents: i.priceCents,
  }));
  const gift = o.items.some((i) =>
    isGiftCertificate(i.product.name, i.product.sku),
  );
  return {
    id: o.id,
    status: o.status,
    totalCents: o.totalCents,
    paidAt: o.paidAt,
    createdAt: o.createdAt,
    lines,
    isGiftCertificate: gift,
  };
}

export async function loadMemberProfile(
  orgId: string,
  orgSlug: string,
  memberId: string,
): Promise<MemberProfileData | null> {
  const db = getOrgDb(orgId);

  const member = await db.member.findFirst({
    where: { id: memberId },
    include: { tier: true, organizationAccount: true },
  });
  if (!member) return null;

  const [
    roles,
    committeeRows,
    rosterPeers,
    registrations,
    subscriptions,
    ordersRaw,
    enrollments,
    ceAwards,
    badges,
    profile360,
    contact,
  ] = await Promise.all([
    db.memberRole.findMany({
      where: { memberId },
      orderBy: [{ isCurrent: "desc" }, { category: "asc" }, { title: "asc" }],
    }),
    db.committeeMembership.findMany({
      where: { memberId },
      include: { committee: true },
      orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
    }),
    member.organizationAccountId
      ? db.member.findMany({
          where: {
            organizationAccountId: member.organizationAccountId,
            id: { not: memberId },
          },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          take: 40,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            status: true,
          },
        })
      : Promise.resolve([]),
    db.eventRegistration.findMany({
      where: { memberId },
      include: { event: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.memberSubscription.findMany({
      where: { memberId },
      include: { tier: true, product: true },
      orderBy: { nextBillAt: "asc" },
    }),
    db.commerceOrder.findMany({
      where: { memberId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    db.courseEnrollment.findMany({
      where: { memberId },
      include: { course: { select: { title: true } } },
      orderBy: { enrolledAt: "desc" },
      take: 30,
    }),
    db.cECreditAward.findMany({
      where: { memberId },
      include: { creditType: { select: { code: true } } },
      orderBy: { awardedAt: "desc" },
      take: 30,
    }),
    db.memberBadge.findMany({
      where: { memberId },
      select: { code: true, label: true },
    }),
    loadMember360(orgId, memberId, orgSlug),
    loadContactRecord(orgId, orgSlug, memberId),
  ]);

  if (!contact) return null;

  const extended = parseExtendedFields(member.customFields);
  const orders = ordersRaw.map(mapOrder);
  const invoices = orders.filter(
    (o) =>
      o.status === "PENDING" ||
      o.lines.some((l) => l.kind === "DUES"),
  );
  const storeOrders = orders.filter(
    (o) => o.lines.some((l) => l.kind === "MERCHANDISE" || l.kind === "OTHER"),
  );
  const giftCertificates = orders.filter((o) => o.isGiftCertificate);

  const committees: MemberProfileCommittee[] = committeeRows.map((c) => ({
    id: c.id,
    committeeId: c.committeeId,
    committeeName: c.committee.name,
    kind: c.committee.kind,
    title: c.title,
    termStart: c.termStart,
    termEnd: c.termEnd,
    isCurrent: c.isCurrent,
  }));

  const roster: MemberProfileRosterPeer[] = rosterPeers.map((p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    jobTitle: p.jobTitle,
    status: p.status,
  }));

  const meetingRegs: MemberProfileRegistration[] = registrations.map((r) => ({
    id: r.id,
    eventId: r.eventId,
    eventTitle: r.event.title,
    status: r.status,
    paidAt: r.paidAt,
    checkedInAt: r.checkedInAt,
    createdAt: r.createdAt,
  }));

  const subs: MemberProfileSubscription[] = subscriptions.map((s) => ({
    id: s.id,
    status: s.status,
    billingInterval: s.billingInterval,
    nextBillAt: s.nextBillAt,
    tierName: s.tier?.name ?? null,
    productName: s.product?.name ?? null,
  }));

  const enrollmentRows: MemberProfileEnrollment[] = enrollments.map((e) => ({
    id: e.id,
    courseTitle: e.course.title,
    status: e.status,
    enrolledAt: e.enrolledAt,
    completedAt: e.completedAt,
  }));

  const ceRows: MemberProfileCeAward[] = ceAwards.map((a) => ({
    id: a.id,
    amount: a.amount,
    creditCode: a.creditType.code,
    source: a.source,
    awardedAt: a.awardedAt,
    note: a.note,
  }));

  return {
    member: {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      status: member.status,
      company: member.company,
      jobTitle: member.jobTitle,
      linkedInUrl: member.linkedInUrl,
      websiteUrl: member.websiteUrl,
      relationshipHealth: member.relationshipHealth,
      lastTouchAt: member.lastTouchAt,
      nextFollowUpAt: member.nextFollowUpAt,
      joinedAt: member.joinedAt,
      renewalDueAt: member.renewalDueAt,
      engagementScore: member.engagementScore,
      engagementTier: member.engagementTier,
      tierId: member.tierId,
      tierName: member.tier?.name ?? null,
      organizationAccountId: member.organizationAccountId,
      organizationName: member.organizationAccount?.name ?? null,
    },
    tags: memberTagsArray(member.tags),
    extended,
    roles: roles as MemberRoleRow[],
    committees,
    rosterPeers: roster,
    registrations: meetingRegs,
    subscriptions: subs,
    orders,
    invoices,
    storeOrders,
    giftCertificates,
    enrollments: enrollmentRows,
    ceAwards: ceRows,
    profile360,
    pulse: parseMemberPulseSnapshot(member.memberPulseData),
    memberBadges: badges,
    contact,
  };
}
