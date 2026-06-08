import { afterEach, describe, expect, it } from "vitest";
import {
  isRenewalCronEnabled,
  isSubscriptionBillingCronEnabled,
} from "@/lib/jobs/cron-gates";

describe("cron-gates", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("renewal cron off unless PULSE_CRON_RENEWALS=true", () => {
    delete process.env.PULSE_CRON_RENEWALS;
    expect(isRenewalCronEnabled()).toBe(false);
    process.env.PULSE_CRON_RENEWALS = "true";
    expect(isRenewalCronEnabled()).toBe(true);
  });

  it("subscription billing cron off unless PULSE_CRON_SUBSCRIPTIONS=true", () => {
    delete process.env.PULSE_CRON_SUBSCRIPTIONS;
    expect(isSubscriptionBillingCronEnabled()).toBe(false);
    process.env.PULSE_CRON_SUBSCRIPTIONS = "true";
    expect(isSubscriptionBillingCronEnabled()).toBe(true);
  });
});
