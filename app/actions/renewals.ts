"use server";

/**
 * Renewal workflows and membership tiers — alpha (staff-configurable steps).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { buildRenewalsDueCsv } from "@/lib/renewals/renewals-report";
import type { Prisma } from "@/app/generated/prisma/client";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const workflowStepSchema = z.object({
  id: z.string(),
  order: z.number().int().min(0),
  type: z.enum(["profile", "dues", "terms", "payment", "welcome", "custom"]),
  label: z.string().min(1).max(120),
  config: z.record(z.string(), z.unknown()).optional(),
});

const workflowSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  tierId: z.string().optional(),
  steps: z.array(workflowStepSchema).min(1).max(20),
});

export async function saveRenewalWorkflow(
  orgSlug: string,
  raw: unknown,
  workflowId?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = workflowSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid workflow" };

    const db = getOrgDb(staff.orgId);
    const steps = parsed.data.steps
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i }));

    if (workflowId) {
      await db.renewalWorkflow.update({
        where: { id: workflowId },
        data: {
          name: parsed.data.name,
          description: parsed.data.description ?? "",
          tierId: parsed.data.tierId ?? null,
          steps: steps as Prisma.InputJsonValue,
        },
      });
      await writeAuditLog({
        orgId: staff.orgId,
        userId: staff.userId,
        action: "renewal.workflow.update",
        entity: "RenewalWorkflow",
        entityId: workflowId,
      });
      revalidatePath(`/${orgSlug}/members/renewals`);
      return { ok: true, data: { id: workflowId } };
    }

    const created = await db.renewalWorkflow.create({
      data: {
        orgId: staff.orgId,
        name: parsed.data.name,
        description: parsed.data.description ?? "",
        tierId: parsed.data.tierId ?? null,
        steps: steps as Prisma.InputJsonValue,
      },
    });
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "renewal.workflow.create",
      entity: "RenewalWorkflow",
      entityId: created.id,
    });
    revalidatePath(`/${orgSlug}/members/renewals`);
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function upsertMemberTier(
  orgSlug: string,
  raw: { id?: string; name: string; priceCents: number; billingInterval: "MONTHLY" | "ANNUAL" },
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    if (raw.id) {
      await db.memberTier.update({
        where: { id: raw.id },
        data: {
          name: raw.name,
          priceCents: raw.priceCents,
          billingInterval: raw.billingInterval,
        },
      });
      revalidatePath(`/${orgSlug}/members/renewals`);
      return { ok: true, data: { id: raw.id } };
    }
    const t = await db.memberTier.create({
      data: {
        orgId: staff.orgId,
        name: raw.name,
        priceCents: raw.priceCents,
        billingInterval: raw.billingInterval,
      },
    });
    revalidatePath(`/${orgSlug}/members/renewals`);
    return { ok: true, data: { id: t.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function listRenewalsDue(orgSlug: string, withinDays = 60) {
  const staff = await requireCapability("member:read", { orgSlug });
  const db = getOrgDb(staff.orgId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  return db.member.findMany({
    where: {
      orgId: staff.orgId,
      renewalDueAt: { lte: cutoff, not: null },
      status: "ACTIVE",
    },
    orderBy: { renewalDueAt: "asc" },
    take: 100,
    include: { tier: true },
  });
}

export async function exportRenewalsDueCsv(
  orgSlug: string,
  withinDays = 90,
): Promise<ActionResult<{ csv: string; count: number }>> {
  try {
    const staff = await requireCapability("member:export", { orgSlug });
    const rows = await listRenewalsDue(orgSlug, withinDays);
    const csv = buildRenewalsDueCsv(
      rows.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        renewalDueAt: m.renewalDueAt,
        tierName: m.tier?.name ?? null,
      })),
    );
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "renewals.export",
      entity: "Member",
      diff: { count: rows.length, withinDays },
    });
    return { ok: true, data: { csv, count: rows.length } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
