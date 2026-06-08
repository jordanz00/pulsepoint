/**
 * LLM / copilot safety boundary — fail-safe contract for AI-coded features.
 *
 * TODAY: Executive copilot is template-only (no external model).
 * FUTURE: Any LLM integration MUST use these guards before calling a provider.
 */

import { sanitizeText, sanitizeTextList } from "@/lib/security/sanitize-text";

/** Allowed copilot modes — extend only with security review. */
export const COPILOT_MODES = ["executive_brief_template"] as const;
export type CopilotMode = (typeof COPILOT_MODES)[number];

/**
 * Rules for future LLM endpoints (enforced in code review + CI).
 * - Never interpolate raw member notes / form text into system prompts
 * - Only structured DB metrics or redacted JSON may reach the model
 * - Output must match a Zod schema; reject free-form markdown from model
 * - Log prompts/responses with audit redaction; staff-only routes
 */
export const LLM_BOUNDARY_RULES = {
  maxUserContextChars: 0,
  maxOutputChars: 4000,
  allowedModes: COPILOT_MODES,
  forbidFreeTextUserContext: true,
  requireStructuredOutput: true,
} as const;

export type StructuredCopilotMetric = {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
};

/**
 * Assert copilot input is structured metrics only — no raw user prose.
 */
export function assertStructuredCopilotInput(
  metrics: StructuredCopilotMetric[],
  mode: CopilotMode,
): void {
  if (!COPILOT_MODES.includes(mode)) {
    throw new Error("COPILOT_MODE_NOT_ALLOWED");
  }
  if (!Array.isArray(metrics) || metrics.length === 0) {
    throw new Error("COPILOT_EMPTY_METRICS");
  }
  if (metrics.length > 50) {
    throw new Error("COPILOT_METRICS_OVERFLOW");
  }
  for (const m of metrics) {
    if (typeof m.id !== "string" || m.id.length > 80) throw new Error("COPILOT_INVALID_METRIC");
    if (typeof m.label !== "string" || m.label.length > 120) throw new Error("COPILOT_INVALID_METRIC");
    if (typeof m.value !== "number" && typeof m.value !== "string") {
      throw new Error("COPILOT_INVALID_METRIC");
    }
  }
}

export type CopilotBriefOutput = {
  atAGlance: string[];
  whatChanged: string[];
  needsAttention: string[];
};

/** Sanitize template copilot output before JSON response / UI render. */
export function sanitizeCopilotBriefOutput(output: CopilotBriefOutput): CopilotBriefOutput {
  return {
    atAGlance: sanitizeTextList(output.atAGlance, 600),
    whatChanged: sanitizeTextList(output.whatChanged, 400),
    needsAttention: sanitizeTextList(output.needsAttention, 400),
  };
}

/**
 * Future: wrap external LLM calls. Throws until explicitly enabled per org + env.
 */
export function assertLlmProviderAllowed(): void {
  if (process.env.PULSE_LLM_ENABLED !== "true") {
    throw new Error("LLM_PROVIDER_DISABLED");
  }
}

/** Strip injection patterns from a string before it could reach a future model context. */
export function sanitizeForLlmContext(text: string): string {
  return sanitizeText(text, { maxLength: 500, stripInjectionPatterns: true });
}
