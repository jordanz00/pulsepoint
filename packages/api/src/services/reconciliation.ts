import { prisma } from "../lib/prisma.js";
import { pullPulsePointMetrics } from "./pulsepoint-client.js";
import { writeAudit } from "../lib/audit.js";

const TOLERANCE_PCT = 2;

export async function runReconciliation(campaignId: string, metricKey: string, actorId?: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
  });

  if (!campaign.pulsepointId) {
    const err = new Error("Campaign not synced to PulsePoint");
    (err as Error & { code: string }).code = "AMS_REC_004";
    throw err;
  }

  const amsSnapshot = await prisma.reportingSnapshot.findFirst({
    where: { campaignId, metricKey, source: "ams_normalized" },
    orderBy: { asOf: "desc" },
  });

  const amsValue = amsSnapshot ? Number(amsSnapshot.value) : Number(campaign.budgetUsd) * 0.1;
  const ppValue = await pullPulsePointMetrics(campaign.pulsepointId, metricKey);

  if (ppValue === null) {
    const err = new Error("Could not pull PulsePoint metric");
    (err as Error & { code: string }).code = "AMS_REC_004";
    throw err;
  }

  const delta = amsValue - ppValue;
  const deltaPct = ppValue === 0 ? 100 : Math.abs((delta / ppValue) * 100);
  const withinTolerance = deltaPct <= TOLERANCE_PCT;

  let deltaExplain = `AMS ${amsValue.toFixed(2)} vs PulsePoint ${ppValue.toFixed(2)} (${deltaPct.toFixed(2)}% delta).`;
  if (!withinTolerance) {
    deltaExplain +=
      " Check metric registry timezone/fees. Common causes: fee lines, view-through window, flight date boundary.";
  }

  const run = await prisma.reconciliationRun.create({
    data: {
      campaignId,
      metricKey,
      amsValue,
      pulsepointValue: ppValue,
      delta,
      deltaExplain,
      withinTolerance,
    },
  });

  await writeAudit({
    entityType: "ReconciliationRun",
    entityId: run.id,
    action: "reconciliation:run",
    actorId,
    after: { metricKey, withinTolerance, deltaExplain },
  });

  return run;
}

export async function explainDelta(campaignId: string, metricKey: string) {
  const latest = await prisma.reconciliationRun.findFirst({
    where: { campaignId, metricKey },
    orderBy: { createdAt: "desc" },
  });
  const def = await prisma.metricDefinition.findUnique({ where: { key: metricKey } });
  return { run: latest, definition: def };
}
