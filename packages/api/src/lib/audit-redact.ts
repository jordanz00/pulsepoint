/**
 * Audit payload redaction — PHI / secret scrubbing for AuditLog rows.
 *
 * WHO THIS IS FOR: lib/audit.ts (writeAudit) and any caller that wants to
 *   precompute a redacted view (tests, exporters).
 * WHAT IT DOES: Walks an arbitrary JSON-shaped payload and replaces the values
 *   of sensitive-looking keys with "[REDACTED]". Truncates long strings.
 *   Collapses NPI arrays into { count, sample } so the audit row still proves
 *   "we validated N NPIs" without storing patient identifiers.
 * HOW IT CONNECTS: writeAudit() pipes before/after through redactForAudit()
 *   before insert. This is defense in depth — services should already avoid
 *   passing PHI into audit payloads, but a typo upstream MUST NOT leak NPIs
 *   into AuditLog.before/after JSON.
 *
 * SECURITY: aligns with SECURE-FORCE.md ("Validate API responses",
 *   "Suppress detailed errors"). Pattern based on industry PHI/PII redactors.
 */

const SENSITIVE_KEY_PATTERN =
  /(npi|email|phone|ssn|dob|password|secret|token|bearer|apiKey|api_key|authorization)/i;
const NPI_ARRAY_KEY_PATTERN = /^(npis|npiList|npi_list|audience|recipients)$/i;
const MAX_STRING_LENGTH = 2000;
const REDACTED = "[REDACTED]";

/**
 * Return a string that proves a value existed without exposing it.
 *
 * For NPIs: keep last 4 digits masked-style ("XXXXXX1234"). For everything
 * else, fall back to "[REDACTED]".
 */
function maskNpi(value: unknown): string {
  if (typeof value !== "string") return REDACTED;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return REDACTED;
  return "XXXXXX" + digits.slice(-4);
}

function truncate(s: string): string {
  if (s.length <= MAX_STRING_LENGTH) return s;
  return s.slice(0, MAX_STRING_LENGTH) + "…[truncated]";
}

function looksLikeNpiArray(arr: unknown[]): boolean {
  if (arr.length === 0) return false;
  const sample = arr.slice(0, Math.min(5, arr.length));
  return sample.every((v) => {
    if (typeof v === "string") {
      return /^\d{10}$/.test(v.replace(/\D/g, ""));
    }
    if (typeof v === "object" && v !== null) {
      return "npi" in (v as Record<string, unknown>);
    }
    return false;
  });
}

function summarizeNpiArray(arr: unknown[]): { count: number; sample: string[] } {
  const sample = arr.slice(0, 3).map((v) => {
    if (typeof v === "string") return maskNpi(v);
    if (typeof v === "object" && v !== null && "npi" in v) {
      return maskNpi((v as Record<string, unknown>).npi);
    }
    return REDACTED;
  });
  return { count: arr.length, sample };
}

/**
 * Recursively redact an audit payload.
 *
 * WHO THIS IS FOR: writeAudit() + tests.
 * WHAT IT DOES: deep-clones the input replacing sensitive values; never throws.
 *
 * Rules:
 *   1. Object keys matching SENSITIVE_KEY_PATTERN → "[REDACTED]" (recurses no further).
 *   2. Object keys in NPI_ARRAY_KEY_PATTERN whose value is an array → summarized.
 *   3. Arrays of NPI-looking values → summarized via summarizeNpiArray.
 *   4. Strings > 2000 chars → truncated.
 *   5. Primitives pass through unchanged.
 *
 * @param payload arbitrary JSON-shaped value
 * @returns redacted clone safe to persist
 */
export function redactForAudit(payload: unknown): unknown {
  if (payload === null || payload === undefined) return payload;
  if (typeof payload === "string") return truncate(payload);
  if (typeof payload === "number" || typeof payload === "boolean") return payload;

  if (Array.isArray(payload)) {
    if (looksLikeNpiArray(payload)) {
      return summarizeNpiArray(payload);
    }
    return payload.map((item) => redactForAudit(item));
  }

  if (typeof payload === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        out[key] = REDACTED;
        continue;
      }
      if (NPI_ARRAY_KEY_PATTERN.test(key) && Array.isArray(value)) {
        out[key] = summarizeNpiArray(value);
        continue;
      }
      out[key] = redactForAudit(value);
    }
    return out;
  }

  return REDACTED;
}
