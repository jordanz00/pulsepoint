import { prisma } from "../lib/prisma.js";

export async function evaluatePacing(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
  });

  const spendSnap = await prisma.reportingSnapshot.findFirst({
    where: { campaignId, metricKey: "spend_usd" },
    orderBy: { asOf: "desc" },
  });

  const spend = spendSnap ? Number(spendSnap.value) : 0;
  const budget = Number(campaign.budgetUsd);
  const pacingPct = budget > 0 ? (spend / budget) * 100 : 0;

  const now = new Date();
  const start = new Date(campaign.flightStart);
  const end = new Date(campaign.flightEnd);
  const totalDays = Math.max(1, (end.getTime() - start.getTime()) / 86400000);
  const elapsedDays = Math.max(0, (now.getTime() - start.getTime()) / 86400000);
  const expectedPct = (elapsedDays / totalDays) * 100;

  const dailyBurn = elapsedDays > 0 ? spend / elapsedDays : 0;
  const remaining = Math.max(0, budget - spend);
  const daysLeft = dailyBurn > 0 ? Math.ceil(remaining / dailyBurn) : null;

  const alerts: string[] = [];
  if (pacingPct >= campaign.pacingAlertPct) {
    alerts.push(`Spend at ${pacingPct.toFixed(1)}% of budget (threshold ${campaign.pacingAlertPct}%)`);
  }
  if (pacingPct > expectedPct + 15) {
    alerts.push(`Ahead of flight curve (expected ~${expectedPct.toFixed(1)}%)`);
  }
  if (pacingPct < expectedPct - 25 && campaign.state === "LIVE") {
    alerts.push(`Behind flight curve — risk of under-delivery`);
  }

  for (const message of alerts) {
    await prisma.pacingAlert.create({
      data: {
        campaignId,
        pacingPct,
        daysLeft,
        message,
      },
    });
  }

  return { pacingPct, expectedPct, daysLeft, alerts };
}
