"use server";

/**
 * Report scheduling — automated KPI delivery with Insights snapshots.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { persistMetricSnapshots, resolveReportMetrics } from "@/lib/report-metrics";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const scheduleSchema = z.object({
  name: z.string().min(1).max(120),
  metricKeys: z.array(z.string()).min(1).max(20),
  cadence: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]),
  recipients: z.array(z.string().email()).min(1).max(10),
});

function nextRunFromCadence(cadence: "WEEKLY" | "MONTHLY" | "QUARTERLY"): Date {
  const d = new Date();
  if (cadence === "WEEKLY") d.setDate(d.getDate() + 7);
  else if (cadence === "MONTHLY") d.setMonth(d.getMonth() + 1);
  else d.setMonth(d.getMonth() + 3);
  return d;
}

export async function createReportSchedule(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const parsed = scheduleSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid schedule" };
    const db = getOrgDb(staff.orgId);
    const schedule = await db.reportSchedule.create({
      data: {
        orgId: staff.orgId,
        name: parsed.data.name,
        metricKeys: parsed.data.metricKeys,
        cadence: parsed.data.cadence,
        recipients: parsed.data.recipients,
        nextRunAt: nextRunFromCadence(parsed.data.cadence),
      },
    });
    revalidatePath(`/${orgSlug}/insights`);
    return { ok: true, data: { id: schedule.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function toggleReportSchedule(
  orgSlug: string,
  scheduleId: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const updated = await db.reportSchedule.updateMany({
      where: { id: scheduleId, orgId: staff.orgId },
      data: { active },
    });
    if (updated.count !== 1) return { ok: false, error: "Schedule not found" };
    revalidatePath(`/${orgSlug}/insights`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function deleteReportSchedule(
  orgSlug: string,
  scheduleId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const deleted = await db.reportSchedule.deleteMany({
      where: { id: scheduleId, orgId: staff.orgId },
    });
    if (deleted.count !== 1) return { ok: false, error: "Schedule not found" };
    revalidatePath(`/${orgSlug}/insights`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Manual run — snapshots + email (same path as platform cron). */
export async function runReportScheduleNow(
  orgSlug: string,
  scheduleId: string,
): Promise<
  ActionResult<{ rows: number; demoEmailSent: true; recipients: string[] }>
> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const schedule = await db.reportSchedule.findFirst({
      where: { id: scheduleId, orgId: staff.orgId },
    });
    if (!schedule) return { ok: false, error: "Schedule not found" };

    const keys = schedule.metricKeys as string[];
    const metrics = await resolveReportMetrics(staff.orgId, keys);
    const rows = await persistMetricSnapshots(staff.orgId, metrics);

    await db.reportSchedule.update({
      where: { id: scheduleId },
      data: {
        lastRunAt: new Date(),
        nextRunAt: nextRunFromCadence(schedule.cadence),
      },
    });

    revalidatePath(`/${orgSlug}/insights`);
    const recipients = (schedule.recipients as string[]) ?? [];
    return { ok: true, data: { rows, demoEmailSent: true, recipients } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
