/**
 * Soft-fail automation — partial success routes to exception queue, flow continues when safe.
 */

import { recordAutomationException } from "@/lib/automation-exception";
import type { AutomationOutcome } from "@/lib/automation-exception";

export type SoftFailStepResult<T> =
  | { ok: true; value: T }
  | { ok: false; queued: true; error: string };

/**
 * Runs a non-authoritative step; failures land in AutomationException (not a black box).
 */
export async function runSoftFailStep<T>(params: {
  orgId: string;
  workflow: string;
  step: string;
  run: () => Promise<T>;
}): Promise<SoftFailStepResult<T>> {
  try {
    const value = await params.run();
    return { ok: true, value };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Step failed";
    await recordAutomationException({
      orgId: params.orgId,
      workflow: params.workflow,
      step: params.step,
      outcome: "PARTIAL_SUCCESS" satisfies AutomationOutcome,
      message,
    });
    return { ok: false, queued: true, error: message };
  }
}
