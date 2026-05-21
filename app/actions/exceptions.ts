"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import type { ActionResult } from "@/app/actions/members";

export async function listOpenExceptions(): Promise<
  ActionResult<{
    items: Array<{
      id: string;
      workflow: string;
      step: string;
      outcome: string;
      message: string;
      createdAt: Date;
    }>;
  }>
> {
  try {
    const staff = await requireCapability("automation:resolve");
    const db = getOrgDb(staff.orgId);
    const items = await db.automationException.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return {
      ok: true,
      data: {
        items: items.map((i) => ({
          id: i.id,
          workflow: i.workflow,
          step: i.step,
          outcome: i.outcome,
          message: i.message,
          createdAt: i.createdAt,
        })),
      },
    };
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return { ok: false, error: "Insufficient permissions" };
    }
    return { ok: false, error: "Unauthorized" };
  }
}

export async function resolveException(
  exceptionId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("automation:resolve");
    const db = getOrgDb(staff.orgId);
    const row = await db.automationException.findFirst({
      where: { id: exceptionId },
    });
    if (!row) return { ok: false, error: "Not found" };

    await db.automationException.update({
      where: { id: exceptionId },
      data: { resolvedAt: new Date() },
    });

    revalidatePath(`/${staff.orgSlug}/exceptions`);
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return { ok: false, error: "Insufficient permissions" };
    }
    return { ok: false, error: "Could not resolve" };
  }
}
