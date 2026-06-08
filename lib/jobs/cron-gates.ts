/**
 * Platform cron feature gates — renewal/subscription jobs off until pilot money path is verified.
 * Set PULSE_CRON_RENEWALS=true only after Stripe drill passes (docs/STRIPE-PILOT-DRILL.md).
 */

export function isRenewalCronEnabled(): boolean {
  return process.env.PULSE_CRON_RENEWALS === "true";
}

export function isSubscriptionBillingCronEnabled(): boolean {
  return process.env.PULSE_CRON_SUBSCRIPTIONS === "true";
}
