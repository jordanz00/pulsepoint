"use server";

/**
 * PulsePoint Commerce — server actions (alpha).
 *
 * SCOPE: Manage products (dues, merchandise, sponsorship); start checkout via
 * the active payment adapter (Stripe primary, manual fallback); record paid
 * orders via webhook. Finance CSV export is admin-gated.
 *
 * STATUS: Alpha. Stripe webhook marks CommerceOrder PAID idempotently; manual fallback still available.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { getActivePaymentAdapter } from "@/lib/adapters/payments";
import { shouldSimulateDemoPayment } from "@/lib/demo-payment";
import type { ActionResult } from "@/app/actions/members";
import { messageFromActionError } from "@/lib/action-errors";
import {
  EXPORT_BATCH_SIZE,
  PAGE_SIZE,
  buildCursorQuery,
  paginateSlice,
  type PaginatedResult,
} from "@/lib/pagination";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import { applyDuesPaymentForOrder } from "@/lib/renewals/apply-dues-payment";
import {
  escapeCommerceCsvCell,
  orderAmountUsd,
} from "@/lib/commerce/csv-export";

const productInputSchema = z.object({
  sku: z.string().min(1).max(60).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  kind: z.enum(["DUES", "MERCHANDISE", "SPONSORSHIP", "OTHER"]).default("OTHER"),
  priceCents: z.coerce.number().int().min(0).max(10_000_000),
  currency: z.string().length(3).default("usd"),
  glCode: z.string().max(40).optional(),
  active: z.coerce.boolean().default(true),
});

const orderInputSchema = z.object({
  productId: z.string().cuid(),
  memberId: z.string().cuid().optional(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
});

export async function createProduct(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("org:settings", { orgSlug });
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid product" };
  const db = getOrgDb(staff.orgId);
  const created = await db.commerceProduct.create({
    data: { orgId: staff.orgId, ...parsed.data },
  });
  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "commerce.product.create",
    entity: "CommerceProduct",
    entityId: created.id,
  });
  revalidatePath(`/${orgSlug}/commerce`);
  return { ok: true as const, productId: created.id };
}

export async function startCheckout(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("event:write", { orgSlug });
  const parsed = orderInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid checkout request" };
  const db = getOrgDb(staff.orgId);
  const product = await db.commerceProduct.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.active) return { ok: false as const, error: "Product not available" };

  const total = product.priceCents * parsed.data.quantity;

  const order = await db.commerceOrder.create({
    data: {
      orgId: staff.orgId,
      memberId: parsed.data.memberId,
      status: "PENDING",
      totalCents: total,
      currency: product.currency,
      items: {
        create: [
          {
            orgId: staff.orgId,
            productId: product.id,
            quantity: parsed.data.quantity,
            priceCents: product.priceCents,
          },
        ],
      },
    },
  });

  const adapter = getActivePaymentAdapter();
  const checkout = await adapter.startCheckout({
    orgId: staff.orgId,
    ourReference: order.id,
    successUrl: parsed.data.successUrl,
    cancelUrl: parsed.data.cancelUrl,
    customerEmail: parsed.data.customerEmail,
    idempotencyKey: `order_${order.id}`,
    items: [
      {
        productRef: product.id,
        name: product.name,
        amountCents: product.priceCents,
        currency: product.currency,
        quantity: parsed.data.quantity,
      },
    ],
  });

  await db.commerceOrder.update({
    where: { id: order.id },
    data: {
      paymentAdapterId: adapter.id,
      providerCheckoutId: checkout.providerCheckoutId,
    },
  });

  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "commerce.checkout.start",
    entity: "CommerceOrder",
    entityId: order.id,
    diff: { adapter: adapter.id, total, productId: product.id },
  });

  return {
    ok: true as const,
    orderId: order.id,
    redirectUrl: checkout.redirectUrl,
    adapter: adapter.id,
  };
}

export async function markOrderPaid(orgSlug: string, orderId: string) {
  const staff = await requireCapability("org:settings", { orgSlug });
  const db = getOrgDb(staff.orgId);
  const order = await db.commerceOrder.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "Order not found" };
  const paidAt = new Date();
  await db.commerceOrder.update({
    where: { id: orderId },
    data: { status: "PAID", paidAt },
  });
  await applyDuesPaymentForOrder(staff.orgId, orderId, paidAt);
  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "commerce.order.mark_paid",
    entity: "CommerceOrder",
    entityId: orderId,
  });
  revalidatePath(`/${orgSlug}/commerce`);
  revalidatePath(`/${orgSlug}/portal`);
  revalidatePath(`/${orgSlug}/members`);
  return { ok: true as const };
}

/**
 * Start public or member-linked checkout for a CommerceProduct.
 *
 * No staff auth required. Resolves member from Clerk when signed in; guest checkout
 * uses optional customerEmail. Returns Stripe (or org-configured adapter) redirect URL.
 */
export async function createMemberCheckoutSession(orgSlug: string, raw: unknown) {
  const parsed = orderInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid checkout request" };

  const org = await (await import("@/lib/prisma")).prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) return { ok: false as const, error: "Organization not found" };

  let memberId = parsed.data.memberId;
  let customerEmail = parsed.data.customerEmail;

  if (!memberId) {
    const { resolvePortalMember } = await import("@/lib/portal/resolve-portal-member");
    const portal = await resolvePortalMember(orgSlug);
    if (portal.ok) {
      memberId = portal.member.id;
      customerEmail = customerEmail ?? portal.member.email ?? undefined;
    }
  }

  const db = getOrgDb(org.id);
  const product = await db.commerceProduct.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.active) return { ok: false as const, error: "Product not available" };

  const total = product.priceCents * parsed.data.quantity;
  const order = await db.commerceOrder.create({
    data: {
      orgId: org.id,
      memberId,
      status: "PENDING",
      totalCents: total,
      currency: product.currency,
      items: {
        create: [
          {
            orgId: org.id,
            productId: product.id,
            quantity: parsed.data.quantity,
            priceCents: product.priceCents,
          },
        ],
      },
    },
  });

  const { getPaymentAdapterForOrg } = await import("@/lib/adapters/payments");
  const adapter = await getPaymentAdapterForOrg(org.id);
  const checkout = await adapter.startCheckout({
    orgId: org.id,
    ourReference: order.id,
    successUrl: parsed.data.successUrl,
    cancelUrl: parsed.data.cancelUrl,
    customerEmail,
    idempotencyKey: `member_checkout_${order.id}`,
    items: [
      {
        productRef: product.id,
        name: product.name,
        amountCents: product.priceCents,
        currency: product.currency,
        quantity: parsed.data.quantity,
      },
    ],
  });

  await db.commerceOrder.update({
    where: { id: order.id },
    data: {
      paymentAdapterId: adapter.id,
      providerCheckoutId: checkout.providerCheckoutId,
    },
  });

  if (shouldSimulateDemoPayment(adapter.id, checkout.redirectUrl)) {
    const paidAt = new Date();
    await db.commerceOrder.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt },
    });
    await applyDuesPaymentForOrder(org.id, order.id, paidAt);
    return {
      ok: true as const,
      orderId: order.id,
      redirectUrl: parsed.data.successUrl,
      adapter: adapter.id,
    };
  }

  return {
    ok: true as const,
    orderId: order.id,
    redirectUrl: checkout.redirectUrl,
    adapter: adapter.id,
  };
}

/** @deprecated Use createMemberCheckoutSession */
export async function startPublicStoreCheckout(
  orgSlug: string,
  raw: unknown,
) {
  return createMemberCheckoutSession(orgSlug, raw);
}

export async function getOrders(
  raw: { cursor?: string; take?: number; status?: string },
  orgSlug?: string,
): Promise<
  ActionResult<
    PaginatedResult<
      Awaited<ReturnType<ReturnType<typeof getOrgDb>["commerceOrder"]["findMany"]>>[number]
    >
  >
> {
  try {
    const staff = await requireCapability("commerce:manage", { orgSlug });
    const take = Math.min(Math.max(raw.take ?? PAGE_SIZE, 1), 100);
    const db = getOrgDb(staff.orgId);
    const where = raw.status
      ? { status: raw.status as "PENDING" | "PAID" | "REFUNDED" | "CANCELLED" }
      : {};

    const [totalCount, rows] = await Promise.all([
      db.commerceOrder.count({ where }),
      db.commerceOrder.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...buildCursorQuery(raw.cursor),
        include: {
          member: { select: { firstName: true, lastName: true, email: true } },
          items: { include: { product: { select: { name: true, glCode: true } } } },
        },
      }),
    ]);

    assertAllRowsBelongToOrg(rows, staff.orgId, "getOrders");
    const { items, nextCursor } = paginateSlice(rows, take);
    return { ok: true, data: { items, nextCursor, totalCount } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

function escapeCsv(value: string): string {
  return escapeCommerceCsvCell(value);
}

export async function exportOrdersCsv(
  orgSlug?: string,
): Promise<ActionResult<{ csv: string; count: number }>> {
  try {
    const staff = await requireCapability("commerce:export", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const lines = [
      "order_id,created_at,product_title,category,gl_code,amount_usd,stripe_fee_usd,net_usd,buyer_email,buyer_name,stripe_session_id",
    ];
    let cursor: string | undefined;
    let count = 0;

    while (true) {
      const batch = await db.commerceOrder.findMany({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: EXPORT_BATCH_SIZE,
        ...buildCursorQuery(cursor),
        include: {
          member: { select: { email: true, firstName: true, lastName: true } },
          items: { include: { product: true } },
        },
      });
      if (batch.length === 0) break;
      assertAllRowsBelongToOrg(batch, staff.orgId, "exportOrdersCsv");

      for (const order of batch) {
        const item = order.items[0];
        const product = item?.product;
        const amountUsd = orderAmountUsd(order.totalCents);
        const feeCents = Math.round(order.totalCents * 0.029 + 30);
        const feeUsd = (feeCents / 100).toFixed(2);
        const netUsd = ((order.totalCents - feeCents) / 100).toFixed(2);
        const buyerName = order.member
          ? `${order.member.firstName} ${order.member.lastName}`.trim()
          : "";
        lines.push(
          [
            order.id,
            order.createdAt.toISOString(),
            escapeCsv(product?.name ?? ""),
            product?.kind ?? "",
            product?.glCode ?? "",
            amountUsd,
            feeUsd,
            netUsd,
            order.member?.email ?? "",
            escapeCsv(buyerName),
            order.providerCheckoutId ?? "",
          ].join(","),
        );
        count += 1;
      }
      cursor = batch[batch.length - 1]?.id;
      if (batch.length < EXPORT_BATCH_SIZE) break;
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "commerce.export",
      entity: "CommerceOrder",
      diff: { count },
    });

    return { ok: true, data: { csv: lines.join("\n"), count } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
