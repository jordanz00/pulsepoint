/**
 * Worker-local Prisma client.
 *
 * WHO THIS IS FOR: `process-sync-job.ts`, `worker.ts` (poll fallback),
 *   `audit.ts`. The worker keeps its own Prisma instance so it can be
 *   built and containerised independently of `@ams/api`.
 * WHAT IT DOES: instantiates a single Prisma client bound to the same
 *   schema as the API (managed by `@ams/api`'s `prisma migrate`). The
 *   worker is a *consumer* of that schema — it never runs migrations.
 * HOW IT CONNECTS: imported wherever the worker reads/writes SyncJob,
 *   Campaign, IdMapping, AuditLog. Uses `DATABASE_URL` from `env.ts`.
 *
 * POWER BI MAPPING: none — read/write only against the operational DB.
 */
import { PrismaClient } from "@prisma/client";

let client: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}

/** Disconnect the Prisma client during graceful shutdown. */
export async function disconnectPrisma(): Promise<void> {
  if (client) {
    await client.$disconnect();
    client = null;
  }
}
