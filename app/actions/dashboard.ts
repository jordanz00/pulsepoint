"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/app/generated/prisma/client";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { DEFAULT_DASHBOARD_WIDGETS, type DashboardWidget } from "@/lib/dashboard-widgets";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const layoutSchema = z.object({
  name: z.string().min(1).max(120),
  widgets: z.array(
    z.object({
      id: z.string(),
      metricKey: z.string(),
      title: z.string(),
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      w: z.number().int().min(1).max(4),
      h: z.number().int().min(1).max(3),
    }),
  ),
  isDefault: z.boolean().optional(),
});

export async function getDashboardLayout(orgSlug: string): Promise<DashboardWidget[]> {
  const staff = await requireCapability("org:settings", { orgSlug });
  const db = getOrgDb(staff.orgId);
  const layout = await db.dashboardLayout.findFirst({
    where: { orgId: staff.orgId, isDefault: true },
  });
  if (!layout) return DEFAULT_DASHBOARD_WIDGETS;
  return layout.widgets as DashboardWidget[];
}

export async function saveDashboardLayout(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const parsed = layoutSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid layout" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.dashboardLayout.findFirst({
      where: { orgId: staff.orgId, isDefault: true },
    });

    if (existing) {
      await db.dashboardLayout.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name,
          widgets: parsed.data.widgets as Prisma.InputJsonValue,
        },
      });
    } else {
      await db.dashboardLayout.create({
        data: {
          orgId: staff.orgId,
          name: parsed.data.name,
          isDefault: true,
          widgets: parsed.data.widgets as Prisma.InputJsonValue,
        },
      });
    }

    revalidatePath(`/${orgSlug}/insights`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
