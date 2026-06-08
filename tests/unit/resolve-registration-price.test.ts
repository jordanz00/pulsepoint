import { describe, expect, it } from "vitest";
import {
  applyPromoDiscount,
  resolveRegistrationPriceCents,
} from "@/lib/events/resolve-registration-price";

describe("resolveRegistrationPriceCents", () => {
  it("uses event base price", () => {
    expect(resolveRegistrationPriceCents({ eventPriceCents: 5000 })).toBe(5000);
  });

  it("prefers ticket type over event base", () => {
    expect(
      resolveRegistrationPriceCents({
        eventPriceCents: 5000,
        ticketPriceCents: 12500,
      }),
    ).toBe(12500);
  });

  it("applies percent promo after ticket selection", () => {
    expect(
      resolveRegistrationPriceCents({
        eventPriceCents: 10000,
        ticketPriceCents: 20000,
        promo: { discountPercent: 25, discountCents: null },
      }),
    ).toBe(15000);
  });

  it("applies fixed promo discount", () => {
    expect(
      resolveRegistrationPriceCents({
        eventPriceCents: 8000,
        promo: { discountPercent: null, discountCents: 1500 },
      }),
    ).toBe(6500);
  });

  it("never returns negative price", () => {
    expect(
      resolveRegistrationPriceCents({
        eventPriceCents: 500,
        promo: { discountPercent: null, discountCents: 2000 },
      }),
    ).toBe(0);
  });
});

describe("applyPromoDiscount", () => {
  it("prefers percent when both set", () => {
    expect(
      applyPromoDiscount(10000, { discountPercent: 10, discountCents: 500 }),
    ).toBe(9000);
  });
});
