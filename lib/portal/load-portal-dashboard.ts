/**
 * Member portal dashboard — membership, events, committees, CE, invoices, community.
 */
import { getOrgDb } from "@/lib/db";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";

export type PortalRenewalTone = "ok" | "warn" | "risk";

export type PortalDashboard = {
  orgSlug: string;
  orgName: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    status: string;
    joinedAt: Date;
    renewalDueAt: Date | null;
    tierName: string | null;
    tierPriceCents: number | null;
    renewalLabel: string | null;
    renewalTone: PortalRenewalTone | null;
  };
  events: {
    total: number;
    upcoming: Array<{
      id: string;
      status: string;
      paidAt: Date | null;
      event: { title: string; startsAt: Date; publicSlug: string };
    }>;
    recent: Array<{
      id: string;
      status: string;
      paidAt: Date | null;
      event: { title: string; startsAt: Date; publicSlug: string };
    }>;
  };
  committees: Array<{
    id: string;
    title: string;
    committeeName: string;
    termEnd: Date | null;
  }>;
  certifications: {
    totalCredits: number;
    enrollments: Array<{
      id: string;
      status: string;
      completedAt: Date | null;
      course: { title: string; creditAmount: number };
    }>;
    awards: Array<{
      id: string;
      amount: number;
      awardedAt: Date;
      creditCode: string;
      note: string;
    }>;
  };
  invoices: {
    totalPaidCents: number;
    pendingCount: number;
    orders: Array<{
      id: string;
      invoiceNumber: string;
      status: string;
      totalCents: number;
      paidAt: Date | null;
      createdAt: Date;
      items: Array<{ name: string; quantity: number; kind: string }>;
    }>;
  };
  community: {
    spaceCount: number;
    spaces: Array<{
      id: string;
      name: string;
      slug: string;
      role: string;
    }>;
    recentPosts: Array<{
      id: string;
      title: string;
      spaceName: string;
      spaceSlug: string;
      createdAt: Date;
    }>;
  };
};

function renewalMeta(renewalDueAt: Date | null, status: string) {
  if (!renewalDueAt || status !== "ACTIVE") return { label: null, tone: null };
  const days = Math.ceil((renewalDueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Renewal overdue", tone: "risk" as const };
  if (days <= 30) return { label: `Renews in ${days} days`, tone: "warn" as const };
  return {
    label: `Renews ${renewalDueAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
    tone: "ok" as const,
  };
}

export async function loadPortalDashboard(
  orgSlug: string,
): Promise<{ ok: true; data: PortalDashboard } | { ok: false; error: string }> {
  const ctx = await resolvePortalMember(orgSlug);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const { org, member } = ctx;
  const db = getOrgDb(org.id);
  const now = new Date();

  const [
    memberFull,
    registrations,
    orders,
    enrollments,
    ceAwards,
    committeeMemberships,
    communityMemberships,
    communityPosts,
  ] = await Promise.all([
    db.member.findFirst({
      where: { id: member.id },
      include: { tier: { select: { name: true, priceCents: true } } },
    }),
    db.eventRegistration.findMany({
      where: { memberId: member.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.commerceOrder.findMany({
      where: { memberId: member.id },
      include: {
        items: { include: { product: { select: { name: true, kind: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.courseEnrollment.findMany({
      where: { memberId: member.id },
      include: { course: { select: { title: true, creditAmount: true } } },
      orderBy: { enrolledAt: "desc" },
      take: 20,
    }),
    db.cECreditAward.findMany({
      where: { memberId: member.id },
      include: { creditType: { select: { code: true } } },
      orderBy: { awardedAt: "desc" },
      take: 15,
    }),
    db.committeeMembership.findMany({
      where: { memberId: member.id, isCurrent: true },
      include: { committee: { select: { name: true, isActive: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.communityMembership.findMany({
      where: { memberId: member.id },
      include: { space: { select: { id: true, name: true, slug: true } } },
      orderBy: { joinedAt: "desc" },
      take: 12,
    }),
    db.communityPost.findMany({
      where: {
        orgId: org.id,
        space: {
          memberships: { some: { memberId: member.id } },
        },
      },
      include: { space: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  if (!memberFull) return { ok: false, error: "Member not found" };

  const renewal = renewalMeta(memberFull.renewalDueAt, memberFull.status);

  const mappedRegs = registrations.map((r) => ({
    id: r.id,
    status: r.status,
    paidAt: r.paidAt,
    event: {
      title: r.event.title,
      startsAt: r.event.startsAt,
      publicSlug: r.event.publicSlug,
    },
  }));

  const upcoming = mappedRegs
    .filter((r) => r.event.startsAt >= now)
    .sort((a, b) => a.event.startsAt.getTime() - b.event.startsAt.getTime())
    .slice(0, 4);

  const recent = mappedRegs
    .filter((r) => r.event.startsAt < now)
    .slice(0, 4);

  const paidOrders = orders.filter((o) => o.status === "PAID");

  return {
    ok: true,
    data: {
      orgSlug,
      orgName: org.name,
      member: {
        id: memberFull.id,
        firstName: memberFull.firstName,
        lastName: memberFull.lastName,
        email: memberFull.email,
        phone: memberFull.phone,
        status: memberFull.status,
        joinedAt: memberFull.joinedAt,
        renewalDueAt: memberFull.renewalDueAt,
        tierName: memberFull.tier?.name ?? null,
        tierPriceCents: memberFull.tier?.priceCents ?? null,
        renewalLabel: renewal.label,
        renewalTone: renewal.tone,
      },
      events: {
        total: registrations.length,
        upcoming,
        recent,
      },
      committees: committeeMemberships
        .filter((c) => c.committee.isActive)
        .map((c) => ({
          id: c.id,
          title: c.title,
          committeeName: c.committee.name,
          termEnd: c.termEnd,
        })),
      certifications: {
        totalCredits: ceAwards.reduce((n, a) => n + a.amount, 0),
        enrollments: enrollments.map((e) => ({
          id: e.id,
          status: e.status,
          completedAt: e.completedAt,
          course: {
            title: e.course.title,
            creditAmount: e.course.creditAmount,
          },
        })),
        awards: ceAwards.map((a) => ({
          id: a.id,
          amount: a.amount,
          awardedAt: a.awardedAt,
          creditCode: a.creditType.code,
          note: a.note,
        })),
      },
      invoices: {
        totalPaidCents: paidOrders.reduce((s, o) => s + o.totalCents, 0),
        pendingCount: orders.filter((o) => o.status === "PENDING").length,
        orders: orders.map((o) => ({
          id: o.id,
          invoiceNumber: `INV-${o.id.slice(-8).toUpperCase()}`,
          status: o.status,
          totalCents: o.totalCents,
          paidAt: o.paidAt,
          createdAt: o.createdAt,
          items: o.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            kind: i.product.kind,
          })),
        })),
      },
      community: {
        spaceCount: communityMemberships.length,
        spaces: communityMemberships.map((m) => ({
          id: m.space.id,
          name: m.space.name,
          slug: m.space.slug,
          role: m.role,
        })),
        recentPosts: communityPosts.map((p) => ({
          id: p.id,
          title: p.title,
          spaceName: p.space.name,
          spaceSlug: p.space.slug,
          createdAt: p.createdAt,
        })),
      },
    },
  };
}
