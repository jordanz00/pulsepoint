/**
 * CRM workflow stage automations — Nimble Workflow Automation (no AI).
 * Runs when a card enters a stage via moveWorkflowRunToStage.
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import { runSoftFailStep } from "@/lib/automation";
import type { OrgDb } from "@/lib/db";

export type StageAutomationAction =
  | "SEND_EMAIL"
  | "CREATE_TASK_NOTE"
  | "ENROLL_SEQUENCE";

export type StageAutomationRule = {
  stageId: string;
  action: StageAutomationAction;
  subject?: string;
  bodyText?: string;
  taskSubject?: string;
  sequenceId?: string;
};

export function parseStageAutomations(raw: unknown): StageAutomationRule[] {
  if (!Array.isArray(raw)) return [];
  const out: StageAutomationRule[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const stageId = typeof r.stageId === "string" ? r.stageId.slice(0, 64) : "";
    const action = r.action as StageAutomationAction;
    if (!stageId || !["SEND_EMAIL", "CREATE_TASK_NOTE", "ENROLL_SEQUENCE"].includes(action)) {
      continue;
    }
    out.push({
      stageId,
      action,
      subject: typeof r.subject === "string" ? r.subject.slice(0, 200) : undefined,
      bodyText: typeof r.bodyText === "string" ? r.bodyText.slice(0, 10_000) : undefined,
      taskSubject: typeof r.taskSubject === "string" ? r.taskSubject.slice(0, 200) : undefined,
      sequenceId: typeof r.sequenceId === "string" ? r.sequenceId.slice(0, 64) : undefined,
    });
  }
  return out;
}

export async function runStageAutomations(params: {
  db: OrgDb;
  orgId: string;
  workflowId: string;
  stageId: string;
  memberId: string;
  stageAutomations: unknown;
}): Promise<void> {
  const rules = parseStageAutomations(params.stageAutomations).filter(
    (r) => r.stageId === params.stageId,
  );
  if (rules.length === 0) return;

  const member = await params.db.member.findFirst({
    where: { id: params.memberId },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
  if (!member) return;

  for (const rule of rules) {
    if (rule.action === "SEND_EMAIL" && member.email && rule.subject && rule.bodyText) {
      await runSoftFailStep({
        orgId: params.orgId,
        workflow: "crm.workflow.stage_email",
        step: `${params.workflowId}:${rule.stageId}`,
        run: async () => {
          await sendEmailWithFailover({
            to: member.email!,
            subject: rule.subject!,
            text: rule.bodyText!,
            html: rule.bodyText!.replace(/\n/g, "<br>"),
          });
        },
      });
    }

    if (rule.action === "CREATE_TASK_NOTE" && rule.taskSubject) {
      const body = rule.bodyText ?? rule.taskSubject;
      await params.db.memberNote.create({
        data: {
          orgId: params.orgId,
          memberId: member.id,
          body: `[Workflow automation] ${rule.taskSubject}\n\n${body}`.slice(0, 2000),
          noteType: "GENERAL",
          channel: "other",
        },
      });
    }

    if (rule.action === "ENROLL_SEQUENCE" && rule.sequenceId) {
      const seq = await params.db.emailSequence.findFirst({
        where: { id: rule.sequenceId, status: "ACTIVE" },
      });
      if (!seq) continue;
      const existing = await params.db.emailSequenceEnrollment.findFirst({
        where: {
          sequenceId: rule.sequenceId,
          memberId: member.id,
          status: "ACTIVE",
        },
      });
      if (existing) continue;
      await params.db.emailSequenceEnrollment.create({
        data: {
          orgId: params.orgId,
          sequenceId: rule.sequenceId,
          memberId: member.id,
          currentStep: 0,
          nextSendAt: new Date(),
        },
      });
    }
  }
}

export function defaultLeadQualificationAutomations(): Prisma.InputJsonValue {
  return [
    {
      stageId: "contacted",
      action: "CREATE_TASK_NOTE",
      taskSubject: "Lead contacted — log outcome",
      bodyText: "Automated note when lead moves to Contacted.",
    },
    {
      stageId: "qualified",
      action: "CREATE_TASK_NOTE",
      taskSubject: "Lead qualified — ready to convert",
      bodyText: "Use Convert to partnership on this card when ready.",
    },
  ] as Prisma.InputJsonValue;
}
