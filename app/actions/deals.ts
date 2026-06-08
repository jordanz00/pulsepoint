"use server";

/**
 * Deal pipeline — org-scoped deals for sponsorship / partnership tracking.
 */

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { z } from "zod";
import type { DealStage } from "@/app/generated/prisma/client";
import type { ActionResult } from "@/app/actions/members";

const createDealSchema = z.object({
  title: z.string().min(1).max(200),
  amountCents: z.coerce.number().int().min(0).max(999_999_999),
  stage: z.enum(["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).default("LEAD"),
  memberId: z.string().cuid().optional(),
  pipelineId: z.string().cuid().optional(),
  assigneeName: z.string().max(80).optional(),
});

export async function listDealPipelines(orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const pipelines = await db.dealPipeline.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    return { ok: true as const, data: pipelines };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function listDeals(orgSlug?: string, pipelineId?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const deals = await db.deal.findMany({
      where: pipelineId ? { pipelineId } : undefined,
      orderBy: { updatedAt: "desc" },
      include: { pipeline: true, lossReason: true },
    });
    return { ok: true as const, data: deals };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function ensureDefaultDealPipeline(orgSlug?: string): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const count = await db.dealPipeline.count();
    if (count > 0) return { ok: true };

    await db.dealPipeline.create({
      data: {
        orgId: staff.orgId,
        name: "Sponsorship & partnerships",
        isDefault: true,
      },
    });
    revalidatePath(`/${staff.orgSlug}/deals`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createDealPipeline(
  orgSlug: string,
  name: string,
): Promise<ActionResult & { pipelineId?: string }> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const trimmed = name.trim().slice(0, 120);
    if (!trimmed) return { ok: false, error: "Pipeline name required" };
    const pipeline = await db.dealPipeline.create({
      data: { orgId: staff.orgId, name: trimmed, isDefault: false },
    });
    revalidatePath(`/${staff.orgSlug}/deals`);
    return { ok: true, pipelineId: pipeline.id };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createDeal(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ dealId: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = createDealSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid deal" };
    const db = getOrgDb(staff.orgId);

    let pipelineId = parsed.data.pipelineId;
    if (!pipelineId) {
      await ensureDefaultDealPipeline(orgSlug);
      const def = await db.dealPipeline.findFirst({
        where: { isDefault: true },
        orderBy: { createdAt: "asc" },
      });
      if (!def) return { ok: false, error: "No pipeline configured" };
      pipelineId = def.id;
    }

    const deal = await db.deal.create({
      data: {
        orgId: staff.orgId,
        pipelineId,
        title: parsed.data.title,
        amountCents: parsed.data.amountCents,
        stage: parsed.data.stage as DealStage,
        memberId: parsed.data.memberId,
        assigneeName: parsed.data.assigneeName ?? "",
        ...(parsed.data.stage === "WON" || parsed.data.stage === "LOST"
          ? { closedAt: new Date() }
          : {}),
      },
    });

    revalidatePath(`/${staff.orgSlug}/deals`);
    revalidatePath(`/${staff.orgSlug}/deals/pipeline`);
    if (parsed.data.memberId) {
      revalidatePath(`/${staff.orgSlug}/members/${parsed.data.memberId}`);
    }
    return { ok: true as const, data: { dealId: deal.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function moveDealStage(
  orgSlug: string,
  dealId: string,
  stage: DealStage,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const deal = await db.deal.findFirst({ where: { id: dealId } });
    if (!deal) return { ok: false, error: "Partnership opportunity not found" };

    await db.deal.update({
      where: { id: dealId },
      data: {
        stage,
        ...(stage === "WON" || stage === "LOST"
          ? { closedAt: new Date(), lostAtStage: stage === "LOST" ? deal.stage : null }
          : { closedAt: null }),
      },
    });

    revalidatePath(`/${staff.orgSlug}/deals`);
    revalidatePath(`/${staff.orgSlug}/deals/pipeline`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
