/**
 * Audit log writer — immutable trail of state changes.
 *
 * WHO THIS IS FOR: any service mutating state (campaigns, creatives, sync, etc.).
 * WHAT IT DOES: Persists an AuditLog row with before/after payloads, redacted
 *   for PHI / secrets via redactForAudit() as defense in depth.
 * HOW IT CONNECTS: All workflow services call writeAudit(); the redactor is
 *   applied here so individual callers cannot accidentally bypass it.
 *
 * SECURITY: No PHI in before/after — see lib/audit-redact.ts for rules.
 */

import { prisma } from "./prisma.js";
import { redactForAudit } from "./audit-redact.js";

type AuditJsonValue = string | number | boolean | null | AuditJsonValue[] | { [key: string]: AuditJsonValue };

/**
 * Insert an immutable audit row.
 *
 * WHO THIS IS FOR: services performing state changes.
 * WHAT IT DOES: Redacts before/after, then writes to AuditLog.
 *
 * @param params audit context — entity, action, optional actor + payloads
 * @returns the created AuditLog row
 */
export async function writeAudit(params: {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  before?: AuditJsonValue;
  after?: AuditJsonValue;
}) {
  const before =
    params.before === undefined
      ? undefined
      : (redactForAudit(params.before) as AuditJsonValue);
  const after =
    params.after === undefined
      ? undefined
      : (redactForAudit(params.after) as AuditJsonValue);

  return prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actorId: params.actorId ?? null,
      before,
      after,
    },
  });
}
