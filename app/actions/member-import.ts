"use server";

/**
 * Member CSV import — staging → review → apply (never blind insert to Member).
 * Supports up to 10,000 rows with batched apply (500 rows per batch).
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import {
  buildColumnIndex,
  memberImportTemplateCsv,
  parseCsvLine,
  parseImportDataRow,
} from "@/lib/member-import-csv";
import type { ActionResult } from "@/app/actions/members";
import {
  IMPORT_LARGE_FILE_THRESHOLD,
  IMPORT_PREVIEW_ROWS,
  MAX_IMPORT_ROWS,
} from "@/lib/member-import-limits";
import { IMPORT_BATCH_SIZE } from "@/lib/pagination";

function normalizeEmail(raw: string | undefined): string | null {
  const e = raw?.trim().toLowerCase();
  return e && e.includes("@") ? e : null;
}

async function resolveTierId(
  db: ReturnType<typeof getOrgDb>,
  orgId: string,
  tierName: string | null,
): Promise<string | null> {
  if (!tierName?.trim()) return null;
  const needle = tierName.trim().toLowerCase();
  const tiers = await db.memberTier.findMany({
    where: { orgId },
    select: { id: true, name: true },
  });
  return tiers.find((t) => t.name.toLowerCase() === needle)?.id ?? null;
}

async function resolveOrganizationAccountId(
  db: ReturnType<typeof getOrgDb>,
  orgId: string,
  name: string | null,
): Promise<string | null> {
  if (!name?.trim()) return null;
  const needle = name.trim().toLowerCase();
  const orgs = await db.memberOrganization.findMany({
    where: { orgId },
    select: { id: true, name: true },
  });
  return orgs.find((o) => o.name.toLowerCase() === needle)?.id ?? null;
}

export async function getMemberImportTemplate(): Promise<ActionResult<{ csv: string }>> {
  return { ok: true, data: { csv: memberImportTemplateCsv() } };
}

export async function stageMembersCsvImport(
  csvText: string,
  orgSlug: string,
  fileName?: string,
): Promise<
  ActionResult<{
    batchId: string;
    rowCount: number;
    previewOnly: boolean;
    largeImport: boolean;
  }>
> {
  try {
    const staff = await requireCapability("member:import", { orgSlug });
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      return { ok: false, error: "CSV must include header and at least one row" };
    }

    const col = buildColumnIndex(lines[0]!);
    if (col.firstname === undefined || col.lastname === undefined) {
      return { ok: false, error: "CSV must include firstName and lastName columns" };
    }

    const dataLines = lines.slice(1);
    if (dataLines.length > MAX_IMPORT_ROWS) {
      return {
        ok: false,
        error: `Import limited to ${MAX_IMPORT_ROWS.toLocaleString()} rows per batch`,
      };
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

    const existingEmails = new Set<string>();
    const existingMembers = await db.member.findMany({
      where: { email: { not: null } },
      select: { email: true },
    });
    for (const m of existingMembers) {
      if (m.email) existingEmails.add(m.email.toLowerCase());
    }

    const stagedRows: Prisma.MemberImportRowCreateManyInput[] = [];
    let rowIndex = 0;

    for (const line of dataLines) {
      const parts = parseCsvLine(line);
      const parsed = parseImportDataRow(parts, col);
      if (!parsed) continue;

      const email = parsed.email;
      let matchMemberId: string | null = null;
      let status: "PENDING" | "SKIPPED_DUPLICATE" = "PENDING";

      if (email) {
        const lower = email.toLowerCase();
        if (existingEmails.has(lower)) {
          status = "SKIPPED_DUPLICATE";
        } else {
          existingEmails.add(lower);
        }
      }

      stagedRows.push({
        orgId: staff.orgId,
        batchId: batch.id,
        rowIndex,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email,
        phone: parsed.phone,
        company: parsed.company,
        jobTitle: parsed.jobTitle,
        memberStatus: parsed.memberStatus,
        tierName: parsed.tierName,
        renewalDueAt: parsed.renewalDueAt,
        organizationName: parsed.organizationName,
        status,
        matchMemberId,
      });
      rowIndex += 1;
    }

    for (let i = 0; i < stagedRows.length; i += IMPORT_BATCH_SIZE) {
      const chunk = stagedRows.slice(i, i + IMPORT_BATCH_SIZE);
      await db.memberImportRow.createMany({ data: chunk });
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
    return {
      ok: true,
      data: {
        batchId: batch.id,
        rowCount: rowIndex,
        previewOnly: rowIndex > IMPORT_PREVIEW_ROWS,
        largeImport: rowIndex > IMPORT_LARGE_FILE_THRESHOLD,
      },
    };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function applyMembersImportBatch(
  batchId: string,
  orgSlug: string,
): Promise<
  ActionResult<{
    applied: number;
    skipped: number;
    batchesProcessed: number;
    totalBatches: number;
  }>
> {
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
      orderBy: { rowIndex: "asc" },
    });

    const tierCache = new Map<string, string | null>();
    const orgCache = new Map<string, string | null>();
    let applied = 0;
    let skipped = 0;
    let batchesProcessed = 0;
    const totalBatches = Math.ceil(rows.length / IMPORT_BATCH_SIZE) || 0;

    for (let i = 0; i < rows.length; i += IMPORT_BATCH_SIZE) {
      const chunk = rows.slice(i, i + IMPORT_BATCH_SIZE);
      batchesProcessed += 1;

      const toCreate: Prisma.MemberCreateManyInput[] = [];
      const rowIds: string[] = [];

      for (const row of chunk) {
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

        let tierId: string | null = null;
        if (row.tierName) {
          const key = row.tierName.trim().toLowerCase();
          if (!tierCache.has(key)) {
            tierCache.set(key, await resolveTierId(db, staff.orgId, row.tierName));
          }
          tierId = tierCache.get(key) ?? null;
        }

        let organizationAccountId: string | null = null;
        if (row.organizationName) {
          const key = row.organizationName.trim().toLowerCase();
          if (!orgCache.has(key)) {
            orgCache.set(
              key,
              await resolveOrganizationAccountId(db, staff.orgId, row.organizationName),
            );
          }
          organizationAccountId = orgCache.get(key) ?? null;
        }

        toCreate.push({
          orgId: staff.orgId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          company: row.company,
          jobTitle: row.jobTitle,
          status: (row.memberStatus as "ACTIVE" | "INACTIVE" | "LAPSED") ?? "ACTIVE",
          tierId,
          renewalDueAt: row.renewalDueAt,
          organizationAccountId,
          tags: [] as Prisma.InputJsonValue,
          customFields: {} as Prisma.InputJsonValue,
        });
        rowIds.push(row.id);
      }

      if (toCreate.length > 0) {
        await db.member.createMany({ data: toCreate });

        const emails = toCreate
          .map((m) => m.email)
          .filter((e): e is string => Boolean(e));
        const created =
          emails.length > 0
            ? await db.member.findMany({
                where: { email: { in: emails } },
                select: { id: true, email: true },
              })
            : await db.member.findMany({
                where: {
                  orgId: staff.orgId,
                  lastName: { in: toCreate.map((m) => m.lastName) },
                },
                orderBy: { createdAt: "desc" },
                take: toCreate.length,
                select: { id: true, email: true, lastName: true },
              });

        const emailToId = new Map(
          created.filter((m) => m.email).map((m) => [m.email!.toLowerCase(), m.id]),
        );

        for (let j = 0; j < toCreate.length; j++) {
          const data = toCreate[j]!;
          const rowId = rowIds[j];
          if (!rowId) continue;
          const memberId = data.email
            ? emailToId.get(data.email.toLowerCase())
            : created[j]?.id;
          if (!memberId) continue;

          await db.memberImportRow.update({
            where: { id: rowId },
            data: { status: "APPLIED", matchMemberId: memberId },
          });
          applied += 1;
        }
      }
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.import_applied",
      entity: "MemberImportBatch",
      entityId: batchId,
      diff: { applied, skipped, batchesProcessed },
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    revalidatePath(`/${staff.orgSlug}/members/imports`);
    revalidatePath(`/${staff.orgSlug}/members/analytics`);
    return {
      ok: true,
      data: { applied, skipped, batchesProcessed, totalBatches },
    };
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
