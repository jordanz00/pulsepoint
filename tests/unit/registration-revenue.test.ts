import { describe, expect, it } from "vitest";
import {
  registrationPaidAmountCents,
  sumRegistrationRevenueCents,
} from "@/lib/events/registration-revenue";

describe("registration revenue", () => {
  it("returns zero when unpaid", () => {
    expect(
      registrationPaidAmountCents({
        paidAt: null,
        event: { priceCents: 5000 },
      }),
    ).toBe(0);
  });

  it("uses event base when no ticket type", () => {
    expect(
      registrationPaidAmountCents({
        paidAt: new Date(),
        event: { priceCents: 5000 },
      }),
    ).toBe(5000);
  });

  it("prefers ticket type price", () => {
    expect(
      registrationPaidAmountCents({
        paidAt: new Date(),
        ticketType: { priceCents: 12500 },
        event: { priceCents: 5000 },
      }),
    ).toBe(12500);
  });

  it("sums paid registrations", () => {
    expect(
      sumRegistrationRevenueCents([
        { paidAt: new Date(), event: { priceCents: 1000 } },
        { paidAt: null, event: { priceCents: 9000 } },
        {
          paidAt: new Date(),
          ticketType: { priceCents: 3000 },
          event: { priceCents: 1000 },
        },
      ]),
    ).toBe(4000);
  });
});
