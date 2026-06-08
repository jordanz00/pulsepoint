/**
 * Email sequences — time-based multi-step outreach (Nimble Email Sequences).
 */

import { sendEmailWithFailover } from "@/lib/adapters/email";
import { runSoftFailStep } from "@/lib/automation";
import type { OrgDb } from "@/lib/db";

export async function processDueSequenceEnrollments(
  db: OrgDb,
  orgId: string,
  limit = 25,
): Promise<{ sent: number; errors: number }> {
  const now = new Date();
  const due = await db.emailSequenceEnrollment.findMany({
    where: {
      orgId,
      status: "ACTIVE",
      nextSendAt: { lte: now },
    },
    take: limit,
    include: {
      sequence: { include: { steps: { orderBy: { stepOrder: "asc" } } } },
    },
  });

  let sent = 0;
  let errors = 0;

  for (const enrollment of due) {
    const steps = enrollment.sequence.steps;
    const step = steps[enrollment.currentStep];
    if (!step) {
      await db.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", nextSendAt: null },
      });
      continue;
    }

    const member = await db.member.findFirst({
      where: { id: enrollment.memberId },
      select: { email: true, firstName: true },
    });
    if (!member?.email) {
      errors += 1;
      continue;
    }

    const sendResult = await runSoftFailStep({
      orgId,
      workflow: "engage.email_sequence",
      step: `${enrollment.sequenceId}:${step.stepOrder}`,
      run: async () => {
        await sendEmailWithFailover({
          to: member.email!,
          subject: step.subject,
          text: step.bodyText,
          html: step.bodyHtml || step.bodyText.replace(/\n/g, "<br>"),
        });
      },
    });

    if (!sendResult.ok) {
      errors += 1;
      continue;
    }

    sent += 1;
    const nextIdx = enrollment.currentStep + 1;
    const nextStep = steps[nextIdx];
    if (!nextStep) {
      await db.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "COMPLETED",
          currentStep: nextIdx,
          lastSentAt: now,
          nextSendAt: null,
        },
      });
    } else {
      const delayMs = Math.max(0, nextStep.delayDays) * 86400000;
      await db.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: nextIdx,
          lastSentAt: now,
          nextSendAt: new Date(now.getTime() + delayMs),
        },
      });
    }
  }

  return { sent, errors };
}
