/**
 * BullMQ wrapper for sync jobs.
 *
 * WHO THIS IS FOR: services/sync-queue.ts (production path) and the worker
 *   process. Falls back to inline execution when Redis is unavailable so
 *   local dev still works.
 * WHAT IT DOES: Lazily constructs a BullMQ Queue + ioredis Redis. Provides
 *   dispatchSyncJob() to enqueue OR run inline. Exposes closeSyncQueue()
 *   for graceful shutdown.
 * HOW IT CONNECTS: server.ts calls closeSyncQueue() on SIGTERM/SIGINT.
 *
 * SECURITY: REDIS_URL comes from env (no hardcoded secrets). Connection
 *   errors degrade gracefully to inline mode rather than crashing the API.
 */

import { Queue } from "bullmq";
import { Redis } from "ioredis";

let queue: Queue | null = null;
let connection: Redis | null = null;

/**
 * Get-or-create the BullMQ queue singleton.
 *
 * @returns Queue, or null if Redis is unreachable
 */
export function getSyncQueue(): Queue | null {
  try {
    if (!queue) {
      connection = new Redis(
        process.env.REDIS_URL ?? "redis://localhost:6380",
        { maxRetriesPerRequest: null },
      );
      queue = new Queue("ams-sync", { connection });
    }
    return queue;
  } catch {
    return null;
  }
}

/**
 * Dispatch a sync job — BullMQ if available, inline otherwise.
 *
 * @param jobId SyncJob.id (already persisted)
 * @returns dispatch mode ("bullmq" or "inline")
 */
export async function dispatchSyncJob(jobId: string) {
  const q = getSyncQueue();
  if (q) {
    await q.add(
      "sync-campaign",
      { jobId },
      { attempts: 5, backoff: { type: "exponential", delay: 3000 } },
    );
    return { dispatched: "bullmq" as const };
  }
  const { processSyncJob } = await import("../services/sync-queue.js");
  await processSyncJob(jobId);
  return { dispatched: "inline" as const };
}

/**
 * Close the queue + underlying Redis connection.
 *
 * WHO THIS IS FOR: server.ts shutdown handler.
 * WHAT IT DOES: Idempotent close; safe to call when never initialized.
 */
export async function closeSyncQueue(): Promise<void> {
  try {
    await queue?.close();
  } catch {
    /* best effort */
  }
  try {
    connection?.disconnect();
  } catch {
    /* best effort */
  }
  queue = null;
  connection = null;
}
