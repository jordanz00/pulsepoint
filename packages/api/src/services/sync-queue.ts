import { prisma } from "../lib/prisma.js";
import { writeAudit } from "../lib/audit.js";
import { pushCampaignToPulsePoint } from "./pulsepoint-client.js";
import { transitionCampaign } from "./campaign-workflow.js";

export async function enqueueSync(campaignId: string, actorId?: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { creatives: true },
  });

  if (campaign.state !== "READY_TO_TRAFFIC" && campaign.state !== "SYNCED") {
    const err = new Error("Campaign must be Ready to Traffic to sync");
    (err as Error & { code: string }).code = "AMS_VAL_003";
    throw err;
  }

  const job = await prisma.syncJob.create({
    data: {
      campaignId,
      status: "PENDING",
      payload: { amsUuid: campaign.amsUuid, triggeredBy: actorId },
    },
  });

  await writeAudit({
    entityType: "SyncJob",
    entityId: job.id,
    action: "sync:enqueued",
    actorId,
    after: { campaignId, status: "PENDING" },
  });

  return job;
}

export async function processSyncJob(jobId: string) {
  const job = await prisma.syncJob.findUniqueOrThrow({
    where: { id: jobId },
    include: {
      campaign: { include: { creatives: true } },
    },
  });

  await prisma.syncJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", startedAt: new Date(), attempt: { increment: 1 } },
  });

  try {
    const c = job.campaign;
    const result = await pushCampaignToPulsePoint({
      amsUuid: c.amsUuid,
      name: c.name,
      budgetUsd: Number(c.budgetUsd),
      flightStart: c.flightStart.toISOString().slice(0, 10),
      flightEnd: c.flightEnd.toISOString().slice(0, 10),
      creativeTags: c.creatives
        .filter((cr) => cr.contentHash)
        .map((cr) => cr.contentHash!),
    });

    await prisma.campaign.update({
      where: { id: c.id },
      data: { pulsepointId: result.pulsepointId },
    });

    await prisma.idMapping.upsert({
      where: { id: `${c.id}-campaign-id` },
      create: {
        id: `${c.id}-campaign-id`,
        campaignId: c.id,
        amsField: "amsUuid",
        pulsepointField: "campaign_id",
        owner: "BOTH",
        amsValue: c.amsUuid,
        pulsepointValue: result.pulsepointId,
        lastSyncedAt: new Date(),
      },
      update: {
        pulsepointValue: result.pulsepointId,
        lastSyncedAt: new Date(),
      },
    });

    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: "SUCCEEDED",
        finishedAt: new Date(),
        errorCode: null,
        errorDetail: null,
      },
    });

    if (c.state === "READY_TO_TRAFFIC") {
      await transitionCampaign(c.id, "SYNCED");
    }

    await writeAudit({
      entityType: "Campaign",
      entityId: c.id,
      action: "sync:succeeded",
      after: { pulsepointId: result.pulsepointId },
    });

    return { ok: true as const, pulsepointId: result.pulsepointId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown sync error";
    const code =
      e instanceof Error && "code" in e && typeof (e as Error & { code: string }).code === "string"
        ? (e as Error & { code: string }).code
        : "AMS_SYNC_001";

    const attempt = job.attempt + 1;
    const dead = attempt >= job.maxAttempts;

    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: dead ? "DEAD" : "FAILED",
        finishedAt: new Date(),
        errorCode: code,
        errorDetail: message,
      },
    });

    await writeAudit({
      entityType: "SyncJob",
      entityId: jobId,
      action: dead ? "sync:dead" : "sync:failed",
      after: { errorCode: code, errorDetail: message, attempt },
    });

    return { ok: false as const, errorCode: code, errorDetail: message };
  }
}
