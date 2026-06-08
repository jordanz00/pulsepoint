/**
 * PulsePoint security fail-safes — import from here in routes, actions, and copilot.
 */

export { redactForAudit } from "@/lib/security/audit-redact";
export { sanitizeText, sanitizeTextList } from "@/lib/security/sanitize-text";
export {
  normalizePayload,
  pickAllowedKeys,
  assertBodyWithinLimit,
} from "@/lib/security/normalize-payload";
export {
  COPILOT_MODES,
  LLM_BOUNDARY_RULES,
  assertStructuredCopilotInput,
  sanitizeCopilotBriefOutput,
  assertLlmProviderAllowed,
  sanitizeForLlmContext,
  type CopilotMode,
  type StructuredCopilotMetric,
  type CopilotBriefOutput,
} from "@/lib/security/llm-boundary";
export {
  checkProductionSecurityConfig,
  isCronAuthorized,
} from "@/lib/security/production-guards";
export {
  enforceRateLimit,
  rejectOversizeJson,
} from "@/lib/security/api-guard";
