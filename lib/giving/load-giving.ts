/**
 * Giving loaders — campaigns with raised totals for staff and public pages.
 */

import { getOrgDb } from "@/lib/db";
import { campaignProgressPct, sumRaisedCents } from "@/lib/giving/campaign-stats";

export async function loadGivingDashboard(orgId: string) {
  const db = getOrgDb(orgId);
  const campaigns = await db.campaign.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      donations: { select: { amountCents: true, paidAt: true } },
      _count: { select: { donations: true } },
    },
    take: 50,
  });

  return campaigns.map((c) => {
    const raisedCents = sumRaisedCents(c.donations);
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      goalCents: c.goalCents,
      status: c.status,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      createdAt: c.createdAt,
      giftCount: c._count.donations,
      raisedCents,
      progressPct: campaignProgressPct(raisedCents, c.goalCents),
    };
  });
}

export async function loadCampaignDetail(orgId: string, campaignId: string) {
  const db = getOrgDb(orgId);
  const campaign = await db.campaign.findFirst({
    where: { id: campaignId },
    include: {
      donations: {
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { member: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });
  if (!campaign) return null;

  const raisedCents = sumRaisedCents(campaign.donations);
  return {
    ...campaign,
    raisedCents,
    progressPct: campaignProgressPct(raisedCents, campaign.goalCents),
    paidGifts: campaign.donations.filter((d) => d.paidAt),
  };
}

export async function loadActiveCampaigns(orgId: string) {
  const db = getOrgDb(orgId);
  const campaigns = await db.campaign.findMany({
    where: { status: "ACTIVE" },
    include: {
      donations: { select: { amountCents: true, paidAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return campaigns.map((c) => {
    const raisedCents = sumRaisedCents(c.donations);
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      goalCents: c.goalCents,
      raisedCents,
      progressPct: campaignProgressPct(raisedCents, c.goalCents),
    };
  });
}
