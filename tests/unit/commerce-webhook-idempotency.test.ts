import { describe, expect, it } from "vitest";
import { shouldSkipCommerceOrderPayment } from "@/lib/commerce/webhook-idempotency";

describe("commerce Stripe webhook idempotency", () => {
  it("skips when order already PAID (replay safe)", () => {
    expect(shouldSkipCommerceOrderPayment({ status: "PAID" })).toBe(true);
  });

  it("processes PENDING orders", () => {
    expect(shouldSkipCommerceOrderPayment({ status: "PENDING" })).toBe(false);
  });

  it("processes other non-terminal states", () => {
    expect(shouldSkipCommerceOrderPayment({ status: "PROCESSING" })).toBe(false);
  });
});
