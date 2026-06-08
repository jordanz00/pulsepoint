/**
 * Platform cron — runs all background jobs for every organization.
 */

import { prisma } from "@/lib/prisma";
import {
  isRenewalCronEnabled,
  isSubscriptionBillingCronEnabled,
} from "@/lib/jobs/cron-gates";
import { runEngagementSweep } from "@/lib/jobs/engagement-sweep";
import { runRenewalSweep } from "@/lib/jobs/renewal-sweep";
import { runDueReportSchedules } from "@/lib/jobs/report-scheduler";
import { runSubscriptionBilling } from "@/lib/jobs/subscription-billing";
import { runDueEventScheduledEmails } from "@/lib/jobs/event-scheduled-email";

export type CronResult = {
  orgId: string;
  slug: string;
  engagement: number;
  renewalReminders: number;
  renewalOrders: number;
  reports: number;
  subscriptions: number;
  eventEmails: number;
};

export async function runPlatformCron(): Promise<CronResult[]> {
  const orgs = await prisma.organization.findMany({ select: { id: true, slug: true } });
  const results: CronResult[] = [];

  for (const org of orgs) {
    const engagement = await runEngagementSweep(org.id);
    const renewal = isRenewalCronEnabled()
      ? await runRenewalSweep(org.id, org.slug)
      : { reminders: 0, orders: 0 };
    const reports = await runDueReportSchedules(org.id);
    const subscriptions = isSubscriptionBillingCronEnabled()
      ? await runSubscriptionBilling(org.id, org.slug)
      : { billed: 0 };
    const eventEmails = await runDueEventScheduledEmails(org.id);

    results.push({
      orgId: org.id,
      slug: org.slug,
      engagement: engagement.count,
      renewalReminders: renewal.reminders,
      renewalOrders: renewal.orders,
      reports: reports.ran,
      subscriptions: subscriptions.billed,
      eventEmails,
    });
  }

  return results;
}
