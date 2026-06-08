"use server";

import type { Prisma } from "@/app/generated/prisma/client";
import { messageFromActionError } from "@/lib/action-errors";
import type { ActionResult } from "@/app/actions/members";
import { getOrgDb } from "@/lib/db";
import {
  EXPORT_BATCH_SIZE,
  PAGE_SIZE,
  buildCursorQuery,
  paginateSlice,
  type PaginatedResult,
} from "@/lib/pagination";
import { requireCapability } from "@/lib/permissions";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import { writeAuditLog } from "@/lib/audit";

export type AuditLogRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  diff: unknown;
  createdAt: Date;
};

export async function getAuditLog(
  raw: {
    cursor?: string;
    take?: number;
    entity?: string;
    action?: string;
    search?: string;
  },
  orgSlug?: string,
): Promise<ActionResult<PaginatedResult<AuditLogRow>>> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const take = Math.min(Math.max(raw.take ?? PAGE_SIZE, 1), 100);
    const db = getOrgDb(staff.orgId);

    const where: Prisma.AuditLogWhereInput = {
      ...(raw.entity ? { entity: raw.entity } : {}),
      ...(raw.action ? { action: { contains: raw.action } } : {}),
      ...(raw.search?.trim()
        ? {
            OR: [
              { action: { contains: raw.search.trim() } },
              { entity: { contains: raw.search.trim() } },
              { entityId: { contains: raw.search.trim() } },
            ],
          }
        : {}),
    };

    const [totalCount, rows] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...buildCursorQuery(raw.cursor),
        select: {
          id: true,
          orgId: true,
          action: true,
          entity: true,
          entityId: true,
          userId: true,
          diff: true,
          createdAt: true,
        },
      }),
    ]);

    assertAllRowsBelongToOrg(rows, staff.orgId, "getAuditLog");
    const { items, nextCursor } = paginateSlice(rows, take);
    return { ok: true, data: { items, nextCursor, totalCount } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportAuditLogCsv(
  orgSlug?: string,
): Promise<ActionResult<{ csv: string; count: number }>> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const lines: string[] = [
      "id,createdAt,action,entity,entityId,userId",
    ];
    let cursor: string | undefined;
    let count = 0;

    while (true) {
      const batch = await db.auditLog.findMany({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: EXPORT_BATCH_SIZE,
        ...buildCursorQuery(cursor),
        select: {
          id: true,
          orgId: true,
          action: true,
          entity: true,
          entityId: true,
          userId: true,
          createdAt: true,
        },
      });
      if (batch.length === 0) break;
      assertAllRowsBelongToOrg(batch, staff.orgId, "exportAuditLogCsv");
      for (const row of batch) {
        lines.push(
          [
            row.id,
            row.createdAt.toISOString(),
            escapeCsv(row.action),
            escapeCsv(row.entity),
            row.entityId ?? "",
            row.userId ?? "",
          ].join(","),
        );
        count += 1;
      }
      cursor = batch[batch.length - 1]?.id;
      if (batch.length < EXPORT_BATCH_SIZE) break;
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "audit.exported",
      entity: "AuditLog",
      diff: { count },
    });

    return { ok: true, data: { csv: lines.join("\n"), count } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
