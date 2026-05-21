"use server";

/**
 * Member CSV import — staging → review → apply (never blind insert to Member).
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import type { ActionResult } from "@/app/actions/members";

const MAX_IMPORT_ROWS = 500;

function normalizeEmail(raw: string | undefined): string | null {
  const e = raw?.trim().toLowerCase();
  return e && e.includes("@") ? e : null;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else current += ch;
  }
  result.push(current);
  return result;
}

export async function stageMembersCsvImport(
  csvText: string,
  orgSlug: string,
  fileName?: string,
): Promise<ActionResult<{ batchId: string; rowCount: number }>> {
  try {
    const staff = await requireCapability("member:import", { orgSlug });
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      return { ok: false, error: "CSV must include header and at least one row" };
    }

    const header = lines[0]!.toLowerCase();
    const cols = header.split(",").map((c) => c.trim());
    const fnIdx = cols.indexOf("firstname");
    const lnIdx = cols.indexOf("lastname");
    const emailIdx = cols.indexOf("email");
    if (fnIdx === -1 || lnIdx === -1) {
      return { ok: false, error: "CSV must include firstName and lastName columns" };
    }

    const dataLines = lines.slice(1);
    if (dataLines.length > MAX_IMPORT_ROWS) {
      return { ok: false, error: `Import limited to ${MAX_IMPORT_ROWS} rows per batch` };
    }

    const db = getOrgDb(staff.orgId);
    const batch = await db.memberImportBatch.create({
      data: {
        orgId: staff.orgId,
        uploadedById: staff.userId,
        fileName: (fileName ?? "upload.csv").slice(0, 200),
        status: "PENDING_REVIEW",
        rowCount: 0,
      },
    });

    let rowIndex = 0;
    for (const line of dataLines) {
      const parts = parseCsvLine(line);
      const firstName = parts[fnIdx]?.trim();
      const lastName = parts[lnIdx]?.trim();
      if (!firstName || !lastName) continue;

      const email = emailIdx >= 0 ? normalizeEmail(parts[emailIdx]) : null;
      let matchMemberId: string | null = null;
      let status: "PENDING" | "SKIPPED_DUPLICATE" = "PENDING";

      if (email) {
        const existing = await db.member.findFirst({ where: { email } });
        if (existing) {
          matchMemberId = existing.id;
          status = "SKIPPED_DUPLICATE";
        }
      }

      await db.memberImportRow.create({
        data: {
          orgId: staff.orgId,
          batchId: batch.id,
          rowIndex,
          firstName,
          lastName,
          email,
          status,
          matchMemberId,
        },
      });
      rowIndex += 1;
    }

    await db.memberImportBatch.update({
      where: { id: batch.id },
      data: { rowCount: rowIndex },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.import_staged",
      entity: "MemberImportBatch",
      entityId: batch.id,
      diff: { rowCount: rowIndex },
    });

    revalidatePath(`/${staff.orgSlug}/members/imports`);
    return { ok: true, data: { batchId: batch.id, rowCount: rowIndex } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function applyMembersImportBatch(
  batchId: string,
  orgSlug: string,
): Promise<ActionResult<{ applied: number; skipped: number }>> {
  try {
    const staff = await requireCapability("member:import", { orgSlug });
    const db = getOrgDb(staff.orgId);

    const claimed = await db.memberImportBatch.updateMany({
      where: { id: batchId, status: "PENDING_REVIEW" },
      data: { status: "APPLIED", appliedAt: new Date() },
    });
    if (claimed.count !== 1) {
      return { ok: false, error: "Batch not found or already processed" };
    }

    const rows = await db.memberImportRow.findMany({
      where: { batchId, status: "PENDING" },
    });

    let applied = 0;
    let skipped = 0;

    for (const row of rows) {
      if (row.email) {
        const dupe = await db.member.findFirst({ where: { email: row.email } });
        if (dupe) {
          await db.memberImportRow.update({
            where: { id: row.id },
            data: { status: "SKIPPED_DUPLICATE", matchMemberId: dupe.id },
          });
          skipped += 1;
          continue;
        }
      }

      const member = await db.member.create({
        data: {
          orgId: staff.orgId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          status: "ACTIVE",
          tags: [],
          customFields: {} as Prisma.InputJsonValue,
        },
      });

      await db.memberImportRow.update({
        where: { id: row.id },
        data: { status: "APPLIED", matchMemberId: member.id },
      });
      applied += 1;
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.import_applied",
      entity: "MemberImportBatch",
      entityId: batchId,
      diff: { applied, skipped },
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    revalidatePath(`/${staff.orgSlug}/members/imports`);
    return { ok: true, data: { applied, skipped } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function rejectMembersImportBatch(
  batchId: string,
  orgSlug: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:import", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const batch = await db.memberImportBatch.findFirst({
      where: { id: batchId, status: "PENDING_REVIEW" },
    });
    if (!batch) return { ok: false, error: "Batch not found" };

    await db.memberImportRow.updateMany({
      where: { batchId, status: "PENDING" },
      data: { status: "REJECTED" },
    });
    await db.memberImportBatch.update({
      where: { id: batchId },
      data: { status: "REJECTED" },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.import_rejected",
      entity: "MemberImportBatch",
      entityId: batchId,
    });

    revalidatePath(`/${staff.orgSlug}/members/imports`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
