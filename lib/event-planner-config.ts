/**
 * EventCore planner JSON stored on Event.plannerConfig.
 */

import { z } from "zod";

export const plannerTaskSchema = z.object({
  id: z.string(),
  label: z.string().max(200),
  done: z.boolean(),
  dueAt: z.string().optional(),
});

export const eventPlannerConfigSchema = z.object({
  checklist: z.array(plannerTaskSchema).default([]),
  budgetNotes: z.string().max(5000).optional(),
  internalNotes: z.string().max(5000).optional(),
  targetAttendance: z.number().int().min(0).optional(),
});

export type EventPlannerConfig = z.infer<typeof eventPlannerConfigSchema>;
export type PlannerTask = z.infer<typeof plannerTaskSchema>;

export const DEFAULT_EVENT_CHECKLIST: PlannerTask[] = [
  { id: "venue", label: "Confirm venue or virtual platform", done: false },
  { id: "agenda", label: "Finalize agenda and speakers", done: false },
  { id: "registration", label: "Open registration & test sign-up flow", done: false },
  { id: "marketing", label: "Send save-the-date and promotion", done: false },
  { id: "materials", label: "Prepare day-of materials & check-in list", done: false },
  { id: "followup", label: "Schedule thank-you / survey email", done: false },
];

export function parsePlannerConfig(raw: unknown): EventPlannerConfig {
  const parsed = eventPlannerConfigSchema.safeParse(raw);
  if (parsed.success) {
    return {
      ...parsed.data,
      checklist:
        parsed.data.checklist.length > 0 ? parsed.data.checklist : DEFAULT_EVENT_CHECKLIST,
    };
  }
  return { checklist: DEFAULT_EVENT_CHECKLIST };
}
