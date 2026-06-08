/**
 * Commerce Stripe webhook — idempotent paid-order handling (pure guards for tests).
 */

export type CommerceOrderPaymentRow = {
  status: string;
};

/** Skip marking paid when webhook replays after success. */
export function shouldSkipCommerceOrderPayment(order: CommerceOrderPaymentRow): boolean {
  return order.status === "PAID";
}
