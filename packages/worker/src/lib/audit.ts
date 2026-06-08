/**
 * Worker-side audit log writer.
 *
 * WHO THIS IS FOR: `process-sync-job.ts`, `worker.ts` (DLQ handler).
 * WHAT IT DOES: writes an immutable AuditLog row matching the API's
 *   `writeAudit` semantics. Kept as a local copy so the worker package
 *   does not depend on the API package — clean separation for the
 *   container image.
 * HOW IT CONNECTS: same `AuditLog` Prisma model used by the API. Rows
 *   from the worker are distinguishable by their `entityType`/`action`
 *   pair (e.g. `SyncJob`/`sync:dead`).
 *
 * SECURITY: callers must NOT pass PHI in `before`/`after`. Worker-side
 *   payloads are limited to identifiers, error codes, and counts.
 */
import type { Prisma } from "@prisma/client";
import { getPrisma } from "./prisma.js";

export interface AuditParams {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
}

export async function writeAudit(params: AuditParams): Promise<void> {
  const prisma = getPrisma();
  await prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actorId: params.actorId ?? null,
      before: params.before ?? undefined,
      after: params.after ?? undefined,
    },
  });
}
