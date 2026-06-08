/**
 * Audit payload redaction — PII / secret scrubbing before AuditLog persist.
 *
 * Defense in depth: even if a caller passes email/NPI/token in diff JSON,
 * writeAuditLog() redacts before insert.
 */

const SENSITIVE_KEY_PATTERN =
  /(npi|email|phone|ssn|dob|password|secret|token|bearer|apiKey|api_key|authorization|refreshToken|accessToken)/i;
const NPI_ARRAY_KEY_PATTERN = /^(npis|npiList|npi_list|audience|recipients)$/i;
const MAX_STRING_LENGTH = 2000;
const REDACTED = "[REDACTED]";

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
    if (typeof v === "string") return /^\d{10}$/.test(v.replace(/\D/g, ""));
    if (typeof v === "object" && v !== null) return "npi" in (v as Record<string, unknown>);
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

/** Recursively redact an audit payload. Never throws. */
export function redactForAudit(payload: unknown): unknown {
  if (payload === null || payload === undefined) return payload;
  if (typeof payload === "string") return truncate(payload);
  if (typeof payload === "number" || typeof payload === "boolean") return payload;

  if (Array.isArray(payload)) {
    if (looksLikeNpiArray(payload)) return summarizeNpiArray(payload);
    return payload.map((item) => redactForAudit(item));
  }

  if (typeof payload === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (NPI_ARRAY_KEY_PATTERN.test(key) && Array.isArray(value)) {
        out[key] = summarizeNpiArray(value);
        continue;
      }
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        out[key] = REDACTED;
        continue;
      }
      out[key] = redactForAudit(value);
    }
    return out;
  }

  return REDACTED;
}
