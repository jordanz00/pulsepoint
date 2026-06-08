/**
 * Audit log writer — PulsePoint compliance trail
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { redactForAudit } from "@/lib/security/audit-redact";

export type AuditInput = {
  orgId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: Prisma.InputJsonValue;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  const diff =
    input.diff === undefined
      ? undefined
      : (redactForAudit(input.diff) as Prisma.InputJsonValue);

  await prisma.auditLog.create({
    data: {
      orgId: input.orgId,
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      diff,
    },
  });
}
