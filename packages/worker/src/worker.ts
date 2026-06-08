/**
 * PulsePoint AMS — BullMQ sync worker entrypoint.
 *
 * WHO THIS IS FOR: production runtime (Container Apps / k8s) and local
 *   dev (`npm run dev -w @ams/worker`). Same code path either way.
 * WHAT IT DOES:
 *   1. Validates env (zod) and exits non-zero if misconfigured.
 *   2. Boots OpenTelemetry auto-instrumentations (no-op if no exporter).
 *   3. Boots the structured pino logger (no `console.log` anywhere).
 *   4. Starts a `/health` HTTP probe for liveness/readiness.
 *   5. Starts a BullMQ Worker on `AMS_WORKER_QUEUE_NAME` with bounded
 *      concurrency, idempotent processing, and a DLQ (`status=DEAD` +
 *      AuditLog) when retries are exhausted.
 *   6. OPTIONAL: starts a polling fallback loop (only when
 *      `AMS_WORKER_ENABLE_FALLBACK_POLL=true`) that uses an atomic
 *      Prisma claim to pick up orphaned PENDING SyncJob rows without
 *      racing the BullMQ consumer.
 *   7. Handles SIGTERM/SIGINT: stop accepting new jobs, drain
 *      in-flight, close Redis + Prisma + telemetry, then exit.
 *
 * HOW IT CONNECTS: shares the Prisma schema with `@ams/api`. The API
 *   enqueues jobs via `getSyncQueue().add('sync-campaign', { jobId })`;
 *   the worker consumes the same queue. No source-level dependency
 *   between the two packages.
 *
 * SECURITY:
 *   - All env reads go through `lib/env.ts`. No raw `process.env` reads
 *     in business logic.
 *   - The PulsePoint client validates endpoint scheme before egress.
 *   - The fallback poll uses `prisma.syncJob.updateMany(... PENDING)`
 *     for atomic single-claim semantics; the same row cannot be
 *     processed twice across worker replicas.
 *
 * TODO(IT):
 *   - The API's `dispatchSyncJob` currently enqueues with
 *     `attempts: 5, backoff: { type: 'exponential', delay: 3000 }`. The
 *     mandate calls for a 30s base. This must be updated on the API
 *     side; the worker enforces `removeOnComplete`/`removeOnFail`
 *     retention here but cannot retroactively change job-level
 *     `attempts`/`backoff` set at enqueue time.
 *   - Wire `OTEL_EXPORTER_OTLP_ENDPOINT` to the Application Insights
 *     OTLP collector once IT provides the endpoint.
 */
import "dotenv/config";
import type { Job } from "bullmq";

import { loadEnv } from "./lib/env.js";
import { initTelemetry, shutdownTelemetry } from "./telemetry.js";

// ---------------------------------------------------------------------------
// Boot order: env → telemetry → modules. Heavy modules (BullMQ, ioredis,
// Prisma) are loaded via `await import` AFTER `sdk.start()` so the OTel
// auto-instrumentations can patch them before first use.
// ---------------------------------------------------------------------------

const env = loadEnv();

initTelemetry({
  serviceName: env.OTEL_SERVICE_NAME,
  exporterEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
});

const { Worker } = await import("bullmq");
const { Redis } = await import("ioredis");

const { initLogger, getLogger } = await import("./lib/logger.js");
const { getPrisma, disconnectPrisma } = await import("./lib/prisma.js");
const { createHealthServer } = await import("./lib/health.js");
const { processSyncJob, markSyncJobDead } = await import("./process-sync-job.js");

const logger = initLogger({ level: env.LOG_LEVEL, serviceName: env.OTEL_SERVICE_NAME });

const counters = {
  processed: 0,
  failed: 0,
  dead: 0,
  inFlight: 0,
};

const health = createHealthServer({
  port: env.WORKER_HEALTH_PORT,
  queueName: env.AMS_WORKER_QUEUE_NAME,
  counters,
  logger,
});
await health.start();

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err: Error) => {
  logger.error({ err: err.message }, "redis connection error");
});

const bullWorker = new Worker<{ jobId: string }>(
  env.AMS_WORKER_QUEUE_NAME,
  async (job) => {
    counters.inFlight += 1;
    const jobId = job.data?.jobId;
    if (!jobId || typeof jobId !== "string") {
      counters.inFlight -= 1;
      throw new Error("Invalid BullMQ job payload: missing jobId");
    }
    const log = logger.child({ bullJobId: job.id, jobId });
    log.info({ attemptsMade: job.attemptsMade }, "received bullmq job");
    try {
      const outcome = await processSyncJob(jobId, { logger: log });
      counters.processed += 1;
      return outcome;
    } finally {
      counters.inFlight -= 1;
    }
  },
  {
    connection,
    concurrency: env.AMS_WORKER_CONCURRENCY,
    // Worker-level retention defaults. Job-level `attempts`/`backoff`
    // are still set at enqueue time on the queue side.
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

bullWorker.on("completed", (job) => {
  logger.info({ bullJobId: job.id, jobId: job.data?.jobId }, "bullmq job completed");
});

bullWorker.on("failed", async (job: Job<{ jobId: string }> | undefined, err: Error) => {
  counters.failed += 1;
  const bullJobId = job?.id;
  const jobId = job?.data?.jobId;
  const attemptsMade = job?.attemptsMade ?? 0;
  const maxAttempts = job?.opts?.attempts ?? env.AMS_WORKER_MAX_ATTEMPTS;
  const exhausted = attemptsMade >= maxAttempts;

  logger.warn(
    { bullJobId, jobId, attemptsMade, maxAttempts, exhausted, err: err.message },
    "bullmq job failed"
  );

  if (exhausted && jobId) {
    counters.dead += 1;
    try {
      const errorCode =
        "code" in err && typeof (err as Error & { code?: string }).code === "string"
          ? (err as Error & { code: string }).code
          : "AMS_SYNC_DEAD";
      await markSyncJobDead(
        jobId,
        { errorCode, errorDetail: err.message },
        logger.child({ bullJobId, jobId })
      );
    } catch (dlqErr) {
      logger.error(
        { jobId, err: dlqErr instanceof Error ? dlqErr.message : String(dlqErr) },
        "failed to write DLQ row"
      );
    }
  }
});

bullWorker.on("error", (err: Error) => {
  logger.error({ err: err.message }, "bullmq worker error");
});

logger.info(
  {
    queue: env.AMS_WORKER_QUEUE_NAME,
    concurrency: env.AMS_WORKER_CONCURRENCY,
    fallbackPoll: env.AMS_WORKER_ENABLE_FALLBACK_POLL,
    healthPort: env.WORKER_HEALTH_PORT,
  },
  "ams sync worker booted"
);

// ---------------------------------------------------------------------------
// Optional fallback polling loop. Disabled by default. Only enable when
// the BullMQ pipeline is unavailable (e.g. dev without Redis writes from
// the API). Uses an atomic claim so polling cannot race the BullMQ
// consumer or other worker replicas.
// ---------------------------------------------------------------------------

let pollHandle: NodeJS.Timeout | null = null;
let polling = false;

async function pollPendingOnce(): Promise<void> {
  if (polling) return;
  polling = true;
  try {
    const prisma = getPrisma();
    const pending = await prisma.syncJob.findMany({
      where: { status: "PENDING" },
      take: env.AMS_WORKER_FALLBACK_POLL_BATCH,
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    for (const row of pending) {
      const claim = await prisma.syncJob.updateMany({
        where: { id: row.id, status: "PENDING" },
        data: { status: "PROCESSING" },
      });
      if (claim.count !== 1) {
        logger.debug({ jobId: row.id }, "poll claim lost (already claimed)");
        continue;
      }
      try {
        await processSyncJob(row.id, { logger: logger.child({ source: "fallback-poll" }) });
        counters.processed += 1;
      } catch (err) {
        counters.failed += 1;
        // Polling has no BullMQ retry envelope. Leave the row in its
        // current status so operators can inspect/retry. Stuck
        // PROCESSING rows should be surfaced via separate ops tooling.
        logger.warn(
          { jobId: row.id, err: err instanceof Error ? err.message : String(err) },
          "fallback poll attempt failed"
        );
      }
    }
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      "fallback poll loop error"
    );
  } finally {
    polling = false;
  }
}

if (env.AMS_WORKER_ENABLE_FALLBACK_POLL) {
  logger.warn(
    { intervalMs: env.AMS_WORKER_FALLBACK_POLL_MS },
    "fallback poll ENABLED — atomic claim against PENDING SyncJob rows"
  );
  pollHandle = setInterval(() => {
    void pollPendingOnce();
  }, env.AMS_WORKER_FALLBACK_POLL_MS);
}

// ---------------------------------------------------------------------------
// Graceful shutdown.
// ---------------------------------------------------------------------------

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutdown initiated");

  const timer = setTimeout(() => {
    logger.error("shutdown timeout — forcing exit");
    process.exit(1);
  }, env.WORKER_SHUTDOWN_TIMEOUT_MS);
  timer.unref();

  if (pollHandle) {
    clearInterval(pollHandle);
    pollHandle = null;
  }

  try {
    await bullWorker.close();
    logger.info("bullmq worker drained");
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      "error closing bullmq worker"
    );
  }

  try {
    await connection.quit();
    logger.info("redis connection closed");
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      "error closing redis"
    );
  }

  try {
    await disconnectPrisma();
    logger.info("prisma disconnected");
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      "error closing prisma"
    );
  }

  try {
    await health.stop();
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      "error closing health server"
    );
  }

  await shutdownTelemetry();

  logger.info("shutdown complete");
  clearTimeout(timer);
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  getLogger().error(
    { reason: reason instanceof Error ? reason.message : String(reason) },
    "unhandled promise rejection"
  );
});
process.on("uncaughtException", (err: Error) => {
  getLogger().fatal({ err: err.message, stack: err.stack }, "uncaught exception");
  void shutdown("uncaughtException");
});
