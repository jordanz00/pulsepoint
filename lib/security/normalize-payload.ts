/**
 * Shared payload normalization — strict allowlists for public APIs and webhooks.
 * Complements Zod schemas; never pass raw client JSON to Prisma or outbound fetch.
 */

import type { ZodType } from "zod";

export type NormalizeResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Parse and strip unknown keys via Zod .strict() or object schema.
 * Returns generic client-safe errors (no stack traces).
 */
export function normalizePayload<T>(
  schema: ZodType<T>,
  raw: unknown,
): NormalizeResult<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first?.path?.length ? `${first.path.join(".")}: ` : "";
    return { ok: false, error: `${path}${first?.message ?? "Invalid payload"}` };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Allowlist keys on a plain object before Zod — drops unexpected fields early.
 */
export function pickAllowedKeys(
  raw: Record<string, unknown>,
  allowed: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in raw) out[key] = raw[key];
  }
  return out;
}

/** Reject oversize JSON bodies before parse (bytes). */
export function assertBodyWithinLimit(contentLength: string | null, maxBytes: number): boolean {
  if (!contentLength) return true;
  const n = Number(contentLength);
  return Number.isFinite(n) && n > 0 && n <= maxBytes;
}
