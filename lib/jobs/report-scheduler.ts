/**
 * Report scheduler — runs due schedules, saves snapshots, emails recipients.
 */

import { getOrgDb } from "@/lib/db";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import {
  persistMetricSnapshots,
  resolveReportMetrics,
} from "@/lib/report-metrics";

function nextRun(cadence: "WEEKLY" | "MONTHLY" | "QUARTERLY"): Date {
  const d = new Date();
  if (cadence === "WEEKLY") d.setDate(d.getDate() + 7);
  else if (cadence === "MONTHLY") d.setMonth(d.getMonth() + 1);
  else d.setMonth(d.getMonth() + 3);
  return d;
}

export async function runDueReportSchedules(orgId: string): Promise<{ ran: number }> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const due = await db.reportSchedule.findMany({
    where: { orgId, active: true, nextRunAt: { lte: now } },
  });

  let ran = 0;

  for (const schedule of due) {
    const keys = schedule.metricKeys as string[];
    const metrics = await resolveReportMetrics(orgId, keys);
    await persistMetricSnapshots(orgId, metrics, now);

    const lines = metrics.map((m) => `${m.label}: ${m.display}`);
    const recipients = (schedule.recipients as string[]) ?? [];
    const body = `${schedule.name}\n\nData as of ${now.toLocaleString()}\n\n${lines.join("\n")}\n\n— PulsePoint Insights`;

    for (const to of recipients) {
      if (!to?.includes("@")) continue;
      await sendEmailWithFailover({
        to,
        subject: `${schedule.name} — ${now.toLocaleDateString()}`,
        text: body,
        idempotencyKey: `report-${schedule.id}-${now.toISOString().slice(0, 10)}-${to}`,
      });
    }

    await db.reportSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: now,
        nextRunAt: nextRun(schedule.cadence),
      },
    });
    ran++;
  }

  return { ran };
}
