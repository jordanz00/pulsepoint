/**
 * Event registration pricing — ticket type + promo, shared by register API and checkout.
 */

import type { getOrgDb } from "@/lib/db";

export type PromoDiscount = {
  discountPercent: number | null;
  discountCents: number | null;
};

export type RegistrationPriceInput = {
  eventPriceCents: number;
  ticketPriceCents?: number | null;
  promo?: PromoDiscount | null;
};

type OrgDb = ReturnType<typeof getOrgDb>;

export function applyPromoDiscount(baseCents: number, promo: PromoDiscount): number {
  if (promo.discountPercent != null && promo.discountPercent > 0) {
    return Math.max(0, Math.round(baseCents * (1 - promo.discountPercent / 100)));
  }
  if (promo.discountCents != null && promo.discountCents > 0) {
    return Math.max(0, baseCents - promo.discountCents);
  }
  return baseCents;
}

/** Pure price: ticket overrides event base; promo applies on top. */
export function resolveRegistrationPriceCents(input: RegistrationPriceInput): number {
  let priceCents = input.eventPriceCents;
  if (input.ticketPriceCents != null) {
    priceCents = input.ticketPriceCents;
  }
  if (input.promo) {
    priceCents = applyPromoDiscount(priceCents, input.promo);
  }
  return priceCents;
}

export type ResolvedRegistrationPrice = {
  priceCents: number;
  promoCodeUsed: string | null;
  ticketName: string | null;
};

/**
 * Load ticket + promo from DB and compute checkout amount.
 * Set consumePromo when creating a new registration (increments promo usedCount once).
 */
export async function resolveEventRegistrationPrice(
  db: OrgDb,
  params: {
    eventId: string;
    eventPriceCents: number;
    ticketTypeId?: string | null;
    promoCode?: string | null;
    consumePromo?: boolean;
  },
): Promise<ResolvedRegistrationPrice> {
  let ticketPriceCents: number | null = null;
  let ticketName: string | null = null;

  if (params.ticketTypeId) {
    const ticket = await db.eventTicketType.findFirst({
      where: { id: params.ticketTypeId, eventId: params.eventId, active: true },
      select: { priceCents: true, name: true },
    });
    if (ticket) {
      ticketPriceCents = ticket.priceCents;
      ticketName = ticket.name;
    }
  }

  let promo: PromoDiscount | null = null;
  let promoCodeUsed: string | null = null;
  const code = params.promoCode?.trim().toUpperCase();

  if (code) {
    const promoRow = await db.eventPromoCode.findFirst({
      where: { eventId: params.eventId, code, active: true },
    });
    if (promoRow && (promoRow.maxUses == null || promoRow.usedCount < promoRow.maxUses)) {
      promoCodeUsed = promoRow.code;
      promo = {
        discountPercent: promoRow.discountPercent,
        discountCents: promoRow.discountCents,
      };
      if (params.consumePromo) {
        await db.eventPromoCode.update({
          where: { id: promoRow.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }
  }

  return {
    priceCents: resolveRegistrationPriceCents({
      eventPriceCents: params.eventPriceCents,
      ticketPriceCents,
      promo,
    }),
    promoCodeUsed,
    ticketName,
  };
}
