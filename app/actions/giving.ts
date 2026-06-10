"use server";

/**
 * PulsePoint Giving — campaigns, online gifts, and staff-recorded donations.
 */

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { getPaymentAdapterForOrg } from "@/lib/adapters/payments";
import { writeAuditLog } from "@/lib/audit";
import { shouldSimulateDemoPayment } from "@/lib/demo-payment";
import { getOrgDb, prisma } from "@/lib/db";
import { GIFT_CSV_HEADER, buildGiftCsvRow } from "@/lib/giving/csv-export";
import { markDonationPaid } from "@/lib/giving/mark-donation-paid";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";
import { requireCapability } from "@/lib/permissions";
import {
  EXPORT_BATCH_SIZE,
  PAGE_SIZE,
  buildCursorQuery,
  paginateSlice,
  type PaginatedResult,
} from "@/lib/pagination";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import {
  campaignInputSchema,
  campaignUpdateSchema,
  dollarsToCents,
  publicDonationInputSchema,
  staffDonationInputSchema,
} from "@/lib/validations/giving";
import type { ActionResult } from "@/app/actions/members";

function goalCentsFromInput(data: {
  goalCents?: number;
  goalDollars?: number;
}): number {
  if (data.goalCents != null) return data.goalCents;
  if (data.goalDollars != null) return dollarsToCents(data.goalDollars);
  return 0;
}

function revalidateGiving(orgSlug: string, campaignId?: string) {
  revalidatePath(`/${orgSlug}/giving`);
  revalidatePath(`/${orgSlug}/give`);
  if (campaignId) {
    revalidatePath(`/${orgSlug}/giving/${campaignId}`);
    revalidatePath(`/${orgSlug}/give/${campaignId}`);
  }
}

export async function createCampaign(orgSlug: string, raw: unknown) {
  try {
    const staff = await requireCapability("giving:manage", { orgSlug });
    const parsed = campaignInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid campaign" };
    const db = getOrgDb(staff.orgId);
    const created = await db.campaign.create({
      data: {
        orgId: staff.orgId,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() ?? "",
        goalCents: goalCentsFromInput(parsed.data),
        status: parsed.data.status,
      },
    });
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "giving.campaign.create",
      entity: "Campaign",
      entityId: created.id,
    });
    revalidateGiving(orgSlug, created.id);
    return { ok: true as const, data: { id: created.id } };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function updateCampaign(orgSlug: string, raw: unknown) {
  try {
    const staff = await requireCapability("giving:manage", { orgSlug });
    const parsed = campaignUpdateSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid campaign update" };
    const db = getOrgDb(staff.orgId);
    const existing = await db.campaign.findFirst({ where: { id: parsed.data.id } });
    if (!existing) return { ok: false as const, error: "Campaign not found" };

    await db.campaign.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description.trim() }
          : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
        ...(parsed.data.goalCents !== undefined || parsed.data.goalDollars !== undefined
          ? { goalCents: goalCentsFromInput(parsed.data) }
          : {}),
      },
    });
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "giving.campaign.update",
      entity: "Campaign",
      entityId: parsed.data.id,
      diff: parsed.data,
    });
    revalidateGiving(orgSlug, parsed.data.id);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function recordDonation(orgSlug: string, raw: unknown) {
  try {
    const staff = await requireCapability("giving:manage", { orgSlug });
    const parsed = staffDonationInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid donation" };
    const db = getOrgDb(staff.orgId);
    const campaign = await db.campaign.findFirst({
      where: { id: parsed.data.campaignId },
    });
    if (!campaign) return { ok: false as const, error: "Campaign not found" };

    const created = await db.donation.create({
      data: {
        orgId: staff.orgId,
        campaignId: parsed.data.campaignId,
        memberId: parsed.data.memberId,
        donorName: parsed.data.donorName.trim(),
        donorEmail: parsed.data.donorEmail?.trim() || null,
        amountCents: dollarsToCents(parsed.data.amountDollars),
        recurring: parsed.data.recurring,
        paidAt: new Date(),
        paymentAdapterId: "manual",
      },
    });
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "giving.donation.record",
      entity: "Donation",
      entityId: created.id,
      diff: { amountCents: created.amountCents, campaignId: parsed.data.campaignId },
    });
    revalidateGiving(orgSlug, parsed.data.campaignId);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function startDonationCheckout(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ redirectUrl: string }>> {
  const parsed = publicDonationInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid gift details" };

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const campaign = await db.campaign.findFirst({
    where: { id: parsed.data.campaignId, status: "ACTIVE" },
  });
  if (!campaign) return { ok: false, error: "Campaign is not accepting gifts" };

  const amountCents = dollarsToCents(parsed.data.amountDollars);
  let memberId: string | null = null;
  const portal = await resolvePortalMember(orgSlug);
  if (portal.ok) memberId = portal.member.id;

  const donation = await db.donation.create({
    data: {
      orgId: org.id,
      campaignId: campaign.id,
      memberId,
      donorName: parsed.data.donorName.trim(),
      donorEmail: parsed.data.donorEmail.trim(),
      amountCents,
      paidAt: null,
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const adapter = await getPaymentAdapterForOrg(org.id);
  const checkout = await adapter.startCheckout({
    orgId: org.id,
    ourReference: donation.id,
    successUrl: `${base}/${orgSlug}/give/${campaign.id}?thanks=1`,
    cancelUrl: `${base}/${orgSlug}/give/${campaign.id}?cancelled=1`,
    customerEmail: parsed.data.donorEmail,
    idempotencyKey: `donation_${donation.id}`,
    items: [
      {
        productRef: campaign.id,
        name: `Gift — ${campaign.name}`,
        amountCents,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  await db.donation.update({
    where: { id: donation.id },
    data: {
      paymentAdapterId: adapter.id,
      providerCheckoutId: checkout.providerCheckoutId ?? null,
    },
  });

  if (shouldSimulateDemoPayment(adapter.id, checkout.redirectUrl)) {
    await markDonationPaid(db, donation.id, { adapterId: adapter.id });
    await writeAuditLog({
      orgId: org.id,
      userId: null,
      action: "giving.donation.paid.demo",
      entity: "Donation",
      entityId: donation.id,
      diff: { amountCents, demo: true },
    });
    return {
      ok: true,
      data: { redirectUrl: `${base}/${orgSlug}/give/${campaign.id}?thanks=1` },
    };
  }

  if (!checkout.redirectUrl) {
    return { ok: false, error: "Online giving is unavailable. Contact the association." };
  }

  return { ok: true, data: { redirectUrl: checkout.redirectUrl } };
}

export async function exportDonorsCsv(
  orgSlug?: string,
  campaignId?: string,
): Promise<ActionResult<{ csv: string; count: number }>> {
  try {
    const staff = await requireCapability("giving:manage", { orgSlug });
    const db = getOrgDb(staff.orgId);
    if (campaignId) {
      const campaign = await db.campaign.findFirst({ where: { id: campaignId } });
      if (!campaign) return { ok: false, error: "Campaign not found" };
    }
    const lines = [GIFT_CSV_HEADER];
    let cursor: string | undefined;
    let count = 0;

    while (true) {
      const batch = await db.donation.findMany({
        where: campaignId ? { campaignId } : undefined,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: EXPORT_BATCH_SIZE,
        ...buildCursorQuery(cursor),
        include: { campaign: { select: { name: true } } },
      });
      if (batch.length === 0) break;
      assertAllRowsBelongToOrg(batch, staff.orgId, "exportDonorsCsv");
      for (const gift of batch) {
        if (!gift.paidAt) continue;
        lines.push(
          buildGiftCsvRow({
            donorName: gift.donorName,
            donorEmail: gift.donorEmail ?? "",
            amountCents: gift.amountCents,
            campaignName: gift.campaign.name,
            paidAt: gift.paidAt.toISOString(),
            createdAt: gift.createdAt.toISOString(),
            memberId: gift.memberId ?? "",
          }),
        );
        count += 1;
      }
      cursor = batch[batch.length - 1]?.id;
      if (batch.length < EXPORT_BATCH_SIZE) break;
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "giving.export",
      entity: "Donation",
      diff: { count, campaignId: campaignId ?? null },
    });

    return { ok: true, data: { csv: lines.join("\n"), count } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function getGifts(
  raw: { cursor?: string; take?: number; campaignId?: string },
  orgSlug?: string,
): Promise<
  ActionResult<
    PaginatedResult<
      Awaited<ReturnType<ReturnType<typeof getOrgDb>["donation"]["findMany"]>>[number]
    >
  >
> {
  try {
    const staff = await requireCapability("giving:read", { orgSlug });
    const take = Math.min(Math.max(raw.take ?? PAGE_SIZE, 1), 100);
    const db = getOrgDb(staff.orgId);
    const where = raw.campaignId ? { campaignId: raw.campaignId } : {};

    const [totalCount, rows] = await Promise.all([
      db.donation.count({ where }),
      db.donation.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...buildCursorQuery(raw.cursor),
        include: { campaign: { select: { name: true } } },
      }),
    ]);

    assertAllRowsBelongToOrg(rows, staff.orgId, "getGifts");
    const { items, nextCursor } = paginateSlice(rows, take);
    return { ok: true, data: { items, nextCursor, totalCount } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

