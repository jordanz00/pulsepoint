"use server";

/**
 * Nimble-style CRM workflows — boards, list view, member-linked cards.
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { WORKFLOW_TEMPLATES } from "@/lib/crm/workflow-templates";
import {
  defaultStageId,
  parseFieldValues,
  parseFields,
  resolveStages,
  stageIdForStep,
  stageIndex,
} from "@/lib/crm/workflow-utils";
import type { WorkflowFieldValues } from "@/lib/crm/workflow-types";
import {
  defaultLeadQualificationAutomations,
  runStageAutomations,
} from "@/lib/crm/workflow-automation";
import { createDeal } from "@/app/actions/deals";
import type { ActionResult } from "@/app/actions/members";

function workflowPaths(orgSlug: string, workflowId: string) {
  return [
    `/${orgSlug}/crm/workflows`,
    `/${orgSlug}/crm/workflows/${workflowId}`,
  ];
}

export async function ensureDefaultCrmWorkflows(orgSlug?: string): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);

    for (const t of WORKFLOW_TEMPLATES) {
      const exists = await db.crmWorkflow.findFirst({
        where: { orgId: staff.orgId, kind: t.kind, fromTemplate: t.templateKey },
      });
      if (exists) continue;

      const legacy = await db.crmWorkflow.findFirst({
        where: { orgId: staff.orgId, kind: t.kind, fromTemplate: null },
      });
      if (legacy && !legacy.fromTemplate) {
        await db.crmWorkflow.update({
          where: { id: legacy.id },
          data: {
            department: t.department,
            stages: t.stages as Prisma.InputJsonValue,
            fields: t.fields as Prisma.InputJsonValue,
            fromTemplate: t.templateKey,
            steps: t.stages.map((s) => ({
              id: s.id,
              order: s.order,
              type: "task",
              label: s.label,
            })) as Prisma.InputJsonValue,
          },
        });
        continue;
      }

      await db.crmWorkflow.create({
        data: {
          orgId: staff.orgId,
          name: t.name,
          kind: t.kind,
          description: t.description,
          department: t.department,
          fromTemplate: t.templateKey,
          steps: t.stages.map((s) => ({
            id: s.id,
            order: s.order,
            type: "task",
            label: s.label,
          })) as Prisma.InputJsonValue,
          stages: t.stages as Prisma.InputJsonValue,
          fields: t.fields as Prisma.InputJsonValue,
          ...(t.templateKey === "lead_qualification"
            ? { stageAutomations: defaultLeadQualificationAutomations() }
            : {}),
        },
      });
    }

    revalidatePath(`/${staff.orgSlug}/crm/workflows`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createWorkflowFromTemplate(
  orgSlug: string,
  templateKey: string,
): Promise<ActionResult & { workflowId?: string }> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const t = WORKFLOW_TEMPLATES.find((x) => x.templateKey === templateKey);
    if (!t) return { ok: false, error: "Template not found" };

    const db = getOrgDb(staff.orgId);
    const workflow = await db.crmWorkflow.create({
      data: {
        orgId: staff.orgId,
        name: `${t.name} (copy)`,
        kind: t.kind,
        description: t.description,
        department: t.department,
        fromTemplate: `${t.templateKey}_custom_${Date.now()}`,
        steps: t.stages.map((s) => ({
          id: s.id,
          order: s.order,
          type: "task",
          label: s.label,
        })) as Prisma.InputJsonValue,
        stages: t.stages as Prisma.InputJsonValue,
        fields: t.fields as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/${staff.orgSlug}/crm/workflows`);
    return { ok: true, workflowId: workflow.id };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function getWorkflowBoard(orgSlug: string, workflowId: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);

    const workflow = await db.crmWorkflow.findFirst({ where: { id: workflowId } });
    if (!workflow) return { ok: false as const, error: "Workflow not found" };

    const stages = resolveStages(workflow.stages, workflow.steps);
    const fields = parseFields(workflow.fields);

    const runs = await db.crmWorkflowRun.findMany({
      where: { workflowId, status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
            relationshipHealth: true,
          },
        },
      },
    });

    const columns = stages.map((stage) => ({
      stage,
      runs: runs
        .filter((r) => {
          const sid = r.stageId || stageIdForStep(stages, r.currentStep);
          return sid === stage.id;
        })
        .map((r) => ({
          id: r.id,
          memberId: r.memberId,
          stageId: r.stageId || stageIdForStep(stages, r.currentStep),
          currentStep: r.currentStep,
          dueAt: r.dueAt,
          fieldValues: parseFieldValues(r.fieldValues),
          member: r.member,
        })),
    }));

    return {
      ok: true as const,
      data: {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          department: workflow.department,
          kind: workflow.kind,
          fromTemplate: workflow.fromTemplate,
        },
        stages,
        fields,
        columns,
        allRuns: runs.length,
      },
    };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function startCrmWorkflowRun(
  workflowId: string,
  memberId: string,
  orgSlug?: string,
): Promise<ActionResult<{ runId: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const workflow = await db.crmWorkflow.findFirst({ where: { id: workflowId } });
    if (!workflow) return { ok: false, error: "Workflow not found" };
    const member = await db.member.findFirst({ where: { id: memberId } });
    if (!member) return { ok: false, error: "Member not found" };

    const stages = resolveStages(workflow.stages, workflow.steps);
    const firstStage = defaultStageId(stages);

    const existing = await db.crmWorkflowRun.findFirst({
      where: { workflowId, memberId, status: "ACTIVE" },
    });
    if (existing) return { ok: false, error: "Member already on this workflow" };

    const run = await db.crmWorkflowRun.create({
      data: {
        orgId: staff.orgId,
        workflowId,
        memberId,
        stageId: firstStage,
        currentStep: 0,
        dueAt: new Date(Date.now() + 7 * 86400000),
      },
    });

    for (const p of workflowPaths(staff.orgSlug, workflowId)) {
      revalidatePath(p);
    }
    revalidatePath(`/${staff.orgSlug}/members/${memberId}`);
    return { ok: true, data: { runId: run.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Advance card to the next stage (legacy step button). */
export async function advanceCrmWorkflowRun(
  runId: string,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const run = await db.crmWorkflowRun.findFirst({
      where: { id: runId },
      include: { workflow: true },
    });
    if (!run) return { ok: false, error: "Card not found" };

    const stages = resolveStages(run.workflow.stages, run.workflow.steps);
    const currentIdx = run.stageId
      ? stageIndex(stages, run.stageId)
      : run.currentStep;
    const nextStage = stages[currentIdx + 1];
    if (!nextStage) {
      await db.crmWorkflowRun.update({
        where: { id: runId },
        data: { status: "COMPLETED", completedAt: new Date(), currentStep: currentIdx + 1 },
      });
    } else {
      return moveWorkflowRunToStage(staff.orgSlug, runId, nextStage.id);
    }

    for (const p of workflowPaths(staff.orgSlug, run.workflowId)) {
      revalidatePath(p);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function moveWorkflowRunToStage(
  orgSlug: string,
  runId: string,
  stageId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const run = await db.crmWorkflowRun.findFirst({
      where: { id: runId },
      include: { workflow: true },
    });
    if (!run) return { ok: false, error: "Card not found" };

    const stages = resolveStages(run.workflow.stages, run.workflow.steps);
    const idx = stageIndex(stages, stageId);
    const isLast = idx >= stages.length - 1;

    await db.crmWorkflowRun.update({
      where: { id: runId },
      data: {
        stageId,
        currentStep: idx,
        ...(isLast
          ? { status: "COMPLETED", completedAt: new Date() }
          : { status: "ACTIVE", completedAt: null }),
      },
    });

    await runStageAutomations({
      db,
      orgId: staff.orgId,
      workflowId: run.workflowId,
      stageId,
      memberId: run.memberId,
      stageAutomations: run.workflow.stageAutomations,
    });

    for (const p of workflowPaths(staff.orgSlug, run.workflowId)) {
      revalidatePath(p);
    }
    revalidatePath(`/${staff.orgSlug}/members/${run.memberId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateWorkflowRunFields(
  orgSlug: string,
  runId: string,
  fieldValues: WorkflowFieldValues,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const run = await db.crmWorkflowRun.findFirst({ where: { id: runId } });
    if (!run) return { ok: false, error: "Card not found" };

    const merged = { ...parseFieldValues(run.fieldValues), ...fieldValues };
    const safe: Record<string, string> = {};
    for (const [k, v] of Object.entries(merged)) {
      safe[k.slice(0, 64)] = String(v).slice(0, 500);
    }

    await db.crmWorkflowRun.update({
      where: { id: runId },
      data: { fieldValues: safe as Prisma.InputJsonValue },
    });

    revalidatePath(`/${staff.orgSlug}/crm/workflows/${run.workflowId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function cancelWorkflowRun(orgSlug: string, runId: string): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const run = await db.crmWorkflowRun.findFirst({ where: { id: runId } });
    if (!run) return { ok: false, error: "Card not found" };

    await db.crmWorkflowRun.update({
      where: { id: runId },
      data: { status: "CANCELLED", completedAt: new Date() },
    });

    revalidatePath(`/${staff.orgSlug}/crm/workflows/${run.workflowId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Qualified lead → sponsorship deal (Nimble convert lead). */
export async function convertWorkflowLeadToDeal(
  orgSlug: string,
  runId: string,
  dealTitle?: string,
): Promise<ActionResult & { dealId?: string }> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const run = await db.crmWorkflowRun.findFirst({
      where: { id: runId },
      include: {
        workflow: true,
        member: { select: { id: true, firstName: true, lastName: true, company: true } },
      },
    });
    if (!run) return { ok: false, error: "Card not found" };
    if (run.workflow.fromTemplate !== "lead_qualification") {
      return { ok: false, error: "Convert is only available on the Lead qualification workflow" };
    }

    const title =
      dealTitle?.trim().slice(0, 120) ||
      `${run.member.firstName} ${run.member.lastName} — ${run.member.company || "Partnership"}`.trim();

    const dealRes = await createDeal(orgSlug, {
      title,
      memberId: run.memberId,
      stage: "QUALIFIED",
      amountCents: 0,
    });
    if (!dealRes.ok) return { ok: false, error: dealRes.error };
    const dealId = (dealRes as { ok: true; data: { dealId: string } }).data.dealId;

    await moveWorkflowRunToStage(orgSlug, runId, "qualified");
    revalidatePath(`/${staff.orgSlug}/deals`);
    return { ok: true, dealId };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function listMemberWorkflowRuns(orgSlug: string, memberId: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const runs = await db.crmWorkflowRun.findMany({
      where: { memberId, status: "ACTIVE" },
      include: {
        workflow: {
          select: { id: true, name: true, department: true, stages: true, steps: true },
        },
      },
    });
    return { ok: true as const, data: runs };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}
