/**
 * EventCore scheduled email processor — runs on platform cron.
 */

import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { executeEventSegmentSend } from "@/lib/event-send-executor";
import type { EventCorrespondenceSegment } from "@/lib/event-correspondence-types";
import { writeAuditLog } from "@/lib/audit";

export async function runDueEventScheduledEmails(orgId: string): Promise<number> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const due = await db.eventScheduledEmail.findMany({
    where: { orgId, status: "SCHEDULED", sendAt: { lte: now } },
    take: 20,
  });

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { slug: true },
  });
  if (!org) return 0;

  let ran = 0;
  for (const row of due) {
    const result = await executeEventSegmentSend({
      orgId,
      orgSlug: org.slug,
      eventId: row.eventId,
      segment: row.segment as EventCorrespondenceSegment,
      subject: row.subject,
      bodyText: row.bodyText,
    });

    await db.eventScheduledEmail.update({
      where: { id: row.id },
      data: {
        status: result.ok ? "SENT" : "FAILED",
        sentAt: result.ok ? new Date() : undefined,
      },
    });

    if (result.ok) {
      ran++;
      await writeAuditLog({
        orgId,
        userId: null,
        action: "eventcore.scheduled_email.sent",
        entity: "EventScheduledEmail",
        entityId: row.id,
        diff: { sent: result.sent, attempted: result.attempted },
      });
    }
  }
  return ran;
}
