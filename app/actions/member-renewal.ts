"use server";

/**
 * Member renewal checkout — public and portal paths for dues revenue.
 */

import { createMemberCheckoutSession } from "@/app/actions/commerce";
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";

export type RenewalCheckoutResult =
  | { ok: true; orderId: string; redirectUrl: string; adapter: string }
  | { ok: false; error: string };

/**
 * Start Stripe (or demo) checkout for the signed-in portal member's dues tier.
 */
export async function startMemberRenewalCheckout(
  orgSlug: string,
): Promise<RenewalCheckoutResult> {
  const ctx = await resolvePortalMember(orgSlug);
  if (!ctx.ok) {
    return { ok: false, error: "Sign in to your member account to renew." };
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const member = await db.member.findFirst({
    where: { id: ctx.member.id, orgId: org.id },
    include: {
      tier: { include: { product: { select: { id: true, active: true } } } },
    },
  });
  if (!member) return { ok: false, error: "Member not found" };

  let productId =
    member.tier?.product?.active ? member.tier.productId : null;

  if (!productId && member.tierId) {
    const linked = await db.memberTier.findFirst({
      where: { id: member.tierId },
      select: { productId: true, product: { select: { active: true } } },
    });
    if (linked?.productId && linked.product?.active) {
      productId = linked.productId;
    }
  }

  if (!productId) {
    const fallback = await db.commerceProduct.findFirst({
      where: { orgId: org.id, kind: "DUES", active: true },
      orderBy: { priceCents: "asc" },
    });
    productId = fallback?.id ?? null;
  }

  if (!productId) {
    return { ok: false, error: "No dues product configured for this tier." };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await createMemberCheckoutSession(orgSlug, {
    productId,
    memberId: member.id,
    quantity: 1,
    successUrl: `${base}/${orgSlug}/portal?renewed=1`,
    cancelUrl: `${base}/${orgSlug}/portal?renewal_cancelled=1`,
    customerEmail: member.email ?? undefined,
  });

  if (!res.ok) return { ok: false, error: res.error };
  if (!res.redirectUrl) {
    return { ok: false, error: "Checkout unavailable." };
  }

  return {
    ok: true,
    orderId: res.orderId,
    redirectUrl: res.redirectUrl,
    adapter: res.adapter,
  };
}

/**
 * Guest or new-member dues checkout from join flow (tier → linked product).
 */
export async function startTierRenewalCheckout(
  orgSlug: string,
  tierId: string,
  customerEmail?: string,
): Promise<RenewalCheckoutResult> {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const tier = await db.memberTier.findFirst({
    where: { id: tierId, orgId: org.id },
    include: { product: { select: { id: true, active: true } } },
  });
  if (!tier) return { ok: false, error: "Membership tier not found" };

  let productId = tier.product?.active ? tier.productId : null;
  if (!productId) {
    const fallback = await db.commerceProduct.findFirst({
      where: { orgId: org.id, kind: "DUES", active: true },
    });
    productId = fallback?.id ?? null;
  }
  if (!productId) {
    return { ok: false, error: "No dues product linked to this tier." };
  }

  let memberId: string | undefined;
  const email = customerEmail?.trim();
  if (email) {
    const member = await db.member.findFirst({
      where: { orgId: org.id, email },
      select: { id: true },
    });
    memberId = member?.id;
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await createMemberCheckoutSession(orgSlug, {
    productId,
    memberId,
    quantity: 1,
    successUrl: `${base}/${orgSlug}/join?paid=1`,
    cancelUrl: `${base}/${orgSlug}/join?cancelled=1`,
    customerEmail: email,
  });

  if (!res.ok) return { ok: false, error: res.error };
  if (!res.redirectUrl) {
    return { ok: false, error: "Checkout unavailable." };
  }

  return {
    ok: true,
    orderId: res.orderId,
    redirectUrl: res.redirectUrl,
    adapter: res.adapter,
  };
}
