/**
 * Text sanitization for display, exports, and copilot templates.
 * Mitigates prompt-injection patterns in user-supplied strings shown to staff.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /disregard\s+(all\s+)?(previous|prior|system)\s+/gi,
  /you\s+are\s+now\s+/gi,
  /new\s+system\s+prompt/gi,
  /<\s*\/?\s*system\s*>/gi,
  /```\s*system/gi,
  /\bDAN\s+mode\b/gi,
  /\bjailbreak\b/gi,
];

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export type SanitizeTextOptions = {
  maxLength?: number;
  stripInjectionPatterns?: boolean;
};

/**
 * Sanitize free text before embedding in UI, PDF, or template copilot output.
 */
export function sanitizeText(input: string, opts: SanitizeTextOptions = {}): string {
  const maxLength = opts.maxLength ?? 500;
  const stripInjection = opts.stripInjectionPatterns ?? true;

  let s = input.normalize("NFKC").replace(CONTROL_CHARS, "");
  if (stripInjection) {
    for (const pattern of INJECTION_PATTERNS) {
      s = s.replace(pattern, "[filtered]");
    }
  }
  s = s.replace(/\n{4,}/g, "\n\n\n").trim();
  if (s.length > maxLength) {
    return s.slice(0, maxLength) + "…";
  }
  return s;
}

/** Sanitize every string in a shallow string array (e.g. briefing bullets). */
export function sanitizeTextList(items: string[], maxLength = 500): string[] {
  return items.map((item) => sanitizeText(item, { maxLength }));
}
