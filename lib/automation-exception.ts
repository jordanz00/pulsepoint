/**
 * Soft-fail exception queue — durable partial-failure routing (not a black box).
 *
 * WHO: Webhooks, imports, future automations
 * WHAT: Persists PARTIAL_SUCCESS / FAILED outcomes for staff triage
 * HOW: recordAutomationException() — pair with Slack/Sheet subscribers later
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { getOrgDb } from "@/lib/db";

export type AutomationOutcome = "PARTIAL_SUCCESS" | "FAILED";

export async function recordAutomationException(params: {
  orgId: string;
  workflow: string;
  step: string;
  outcome: AutomationOutcome;
  message?: string;
  context?: Record<string, unknown>;
}): Promise<string> {
  const db = getOrgDb(params.orgId);
  const row = await db.automationException.create({
    data: {
      orgId: params.orgId,
      workflow: params.workflow.slice(0, 80),
      step: params.step.slice(0, 80),
      outcome: params.outcome,
      message: (params.message ?? "").slice(0, 2000),
      context: (params.context ?? {}) as Prisma.InputJsonValue,
    },
  });
  return row.id;
}
