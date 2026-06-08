import type { WorkflowField, WorkflowStage, WorkflowStep } from "@/lib/crm/workflow-types";

export function stepsToStages(steps: WorkflowStep[]): WorkflowStage[] {
  return steps.map((s, i) => ({
    id: s.id,
    order: s.order ?? i,
    label: s.label,
  }));
}

export function resolveStages(stagesJson: unknown, stepsJson: unknown): WorkflowStage[] {
  const stages = parseStages(stagesJson);
  if (stages.length > 0) return stages;
  const steps = parseSteps(stepsJson);
  return stepsToStages(steps);
}

export function parseStages(json: unknown): WorkflowStage[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((s): s is WorkflowStage => typeof s === "object" && s !== null && "id" in s && "label" in s)
    .map((s, i) => ({
      id: String(s.id),
      order: typeof s.order === "number" ? s.order : i,
      label: String(s.label),
      instructions: typeof s.instructions === "string" ? s.instructions : undefined,
    }))
    .sort((a, b) => a.order - b.order);
}

export function parseSteps(json: unknown): WorkflowStep[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((s): s is WorkflowStep => typeof s === "object" && s !== null && "label" in s)
    .map((s, i) => ({
      id: String((s as WorkflowStep).id ?? `step-${i}`),
      order: typeof (s as WorkflowStep).order === "number" ? (s as WorkflowStep).order : i,
      type: String((s as WorkflowStep).type ?? "task"),
      label: String((s as WorkflowStep).label),
    }));
}

export function parseFields(json: unknown): WorkflowField[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((f): f is WorkflowField => typeof f === "object" && f !== null && "id" in f && "label" in f)
    .map((f) => ({
      id: String(f.id),
      label: String(f.label),
      type: f.type === "date" || f.type === "select" ? f.type : "text",
      options: Array.isArray(f.options) ? f.options.map(String) : undefined,
    }));
}

export function parseFieldValues(json: unknown): Record<string, string> {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(json)) {
    if (typeof v === "string") out[k] = v;
    else if (v != null) out[k] = String(v);
  }
  return out;
}

export function stageIndex(stages: WorkflowStage[], stageId: string): number {
  const idx = stages.findIndex((s) => s.id === stageId);
  return idx >= 0 ? idx : 0;
}

export function defaultStageId(stages: WorkflowStage[]): string {
  return stages[0]?.id ?? "";
}

export function stageIdForStep(stages: WorkflowStage[], stepIndex: number): string {
  return stages[stepIndex]?.id ?? defaultStageId(stages);
}
