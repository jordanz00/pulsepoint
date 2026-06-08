/**
 * Worker-local SyncJob processor.
 *
 * WHO THIS IS FOR: `worker.ts` — both the BullMQ consumer path and the
 *   opt-in polling fallback path call this function.
 * WHAT IT DOES: idempotently advances a SyncJob through its lifecycle:
 *     PENDING/PROCESSING/FAILED → push to PulsePoint → SUCCEEDED
 *   Terminal states (SUCCEEDED, DEAD) short-circuit so retries never
 *   redo completed work or fight a permanently-failed job.
 * HOW IT CONNECTS: imports the worker-local Prisma client, audit
 *   helper, and PulsePoint client. Shares the `SyncJob`, `Campaign`,
 *   `IdMapping`, and `AuditLog` Prisma models with `@ams/api` (single
 *   source of truth = the Prisma schema in the api package).
 *
 * NOTES vs api/src/services/sync-queue.ts:
 *   - On intermediate (retryable) errors the worker keeps SyncJob.status
 *     = PROCESSING and only records errorCode/errorDetail. The terminal
 *     transition to DEAD is performed by the BullMQ `failed` handler in
 *     `worker.ts` once attempts are exhausted. This avoids the FAILED
 *     skip-loop that the original API-side code had when paired with
 *     idempotency checks. See §11 of the supervisor rule for context.
 *
 * SECURITY:
 *   - All status changes go through Prisma (parameterised). No string
 *     SQL.
 *   - PulsePoint push uses an Idempotency-Key derived from `syncJob.id`
 *     so a BullMQ-retried in-flight push will not create a duplicate
 *     campaign on the execution side.
 *   - No PHI is written to AuditLog payloads.
 */
import type { Logger } from "pino";
import { getPrisma } from "./lib/prisma.js";
import { writeAudit } from "./lib/audit.js";
import { pushCampaignToPulsePoint } from "./pulsepoint-client.js";

export type ProcessOutcome =
  | { ok: true; pulsepointId: string }
  | { ok: false; skipped: true; reason: "already_succeeded" | "already_dead" }
  | { ok: false; skipped: false; errorCode: string; errorDetail: string };

export interface ProcessOptions {
  logger: Logger;
}

/**
 * Process a SyncJob idempotently.
 *
 * @param jobId — SyncJob.id (UUID).
 * @param opts.logger — bound child logger from the worker.
 * @throws on retryable errors (lets BullMQ trigger backoff). The worker's
 *         BullMQ `failed` handler is responsible for setting DEAD when
 *         retries are exhausted.
 */
export async function processSyncJob(
  jobId: string,
  opts: ProcessOptions
): Promise<ProcessOutcome> {
  const prisma = getPrisma();
  const log = opts.logger.child({ jobId });

  const job = await prisma.syncJob.findUniqueOrThrow({
    where: { id: jobId },
    include: {
      campaign: { include: { creatives: true } },
    },
  });

  if (job.status === "SUCCEEDED") {
    log.info({ status: job.status }, "skip already-succeeded sync job (idempotent)");
    return { ok: false, skipped: true, reason: "already_succeeded" };
  }
  if (job.status === "DEAD") {
    log.warn({ status: job.status }, "skip dead sync job (manual intervention required)");
    return { ok: false, skipped: true, reason: "already_dead" };
  }

  // Atomic transition into PROCESSING with attempt increment. The WHERE
  // clause guards against a concurrent terminal write between the read
  // above and this update.
  await prisma.syncJob.updateMany({
    where: {
      id: jobId,
      status: { notIn: ["SUCCEEDED", "DEAD"] },
    },
    data: {
      status: "PROCESSING",
      startedAt: new Date(),
      attempt: { increment: 1 },
    },
  });

  const c = job.campaign;
  log.info(
    { campaignId: c.id, amsUuid: c.amsUuid, attempt: job.attempt + 1 },
    "processing sync job"
  );

  try {
    const result = await pushCampaignToPulsePoint(
      {
        amsUuid: c.amsUuid,
        name: c.name,
        budgetUsd: Number(c.budgetUsd),
        flightStart: c.flightStart.toISOString().slice(0, 10),
        flightEnd: c.flightEnd.toISOString().slice(0, 10),
        creativeTags: c.creatives
          .filter((cr) => cr.contentHash)
          .map((cr) => cr.contentHash!),
      },
      { idempotencyKey: job.id }
    );

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
      // Simple state advance — full transition validation lives in the API
      // service and is exercised when humans drive the campaign through
      // the FSM. Worker-side advance to SYNCED is unconditional once the
      // PulsePoint push has succeeded.
      await prisma.campaign.update({
        where: { id: c.id },
        data: { state: "SYNCED" },
      });
      await writeAudit({
        entityType: "Campaign",
        entityId: c.id,
        action: "state:READY_TO_TRAFFIC→SYNCED",
        before: { state: "READY_TO_TRAFFIC" },
        after: { state: "SYNCED", source: "worker" },
      });
    }

    await writeAudit({
      entityType: "Campaign",
      entityId: c.id,
      action: "sync:succeeded",
      after: { pulsepointId: result.pulsepointId, source: "worker" },
    });

    log.info(
      { campaignId: c.id, pulsepointId: result.pulsepointId },
      "sync job succeeded"
    );

    return { ok: true, pulsepointId: result.pulsepointId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown sync error";
    const code =
      e instanceof Error && "code" in e && typeof (e as Error & { code: string }).code === "string"
        ? (e as Error & { code: string }).code
        : "AMS_SYNC_001";

    // Retryable failure: keep status=PROCESSING, record error metadata.
    // BullMQ owns the retry decision (backoff + attempts). The terminal
    // DEAD transition is performed by the worker's `failed` handler when
    // attempts are exhausted.
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        errorCode: code,
        errorDetail: message,
      },
    });

    await writeAudit({
      entityType: "SyncJob",
      entityId: jobId,
      action: "sync:attempt_failed",
      after: { errorCode: code, errorDetail: message, attempt: job.attempt + 1 },
    });

    log.warn({ err: message, errorCode: code }, "sync attempt failed; throwing for BullMQ retry");
    throw e;
  }
}

/**
 * Mark a SyncJob as DEAD after BullMQ retries are exhausted. Called from
 * the worker's `failed` event handler. Idempotent — re-invoking after a
 * row is already DEAD is a no-op.
 */
export async function markSyncJobDead(
  jobId: string,
  reason: { errorCode?: string; errorDetail?: string },
  log: Logger
): Promise<void> {
  const prisma = getPrisma();
  const claim = await prisma.syncJob.updateMany({
    where: { id: jobId, status: { not: "DEAD" } },
    data: {
      status: "DEAD",
      finishedAt: new Date(),
      errorCode: reason.errorCode ?? "AMS_SYNC_DEAD",
      errorDetail: reason.errorDetail ?? "Retries exhausted",
    },
  });
  if (claim.count === 0) {
    log.info({ jobId }, "DLQ transition skipped — already DEAD");
    return;
  }
  await writeAudit({
    entityType: "SyncJob",
    entityId: jobId,
    action: "sync:dead",
    after: {
      errorCode: reason.errorCode ?? "AMS_SYNC_DEAD",
      errorDetail: reason.errorDetail ?? "Retries exhausted",
      source: "worker",
    },
  });
  log.error({ jobId, ...reason }, "sync job moved to DLQ (DEAD)");
}
