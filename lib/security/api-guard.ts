/**
 * API route guards — rate limits and generic JSON body checks.
 */

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { assertBodyWithinLimit } from "@/lib/security/normalize-payload";

export type ApiRateLimitOptions = {
  routeKey: string;
  limit: number;
  windowMs: number;
};

export function enforceRateLimit(
  req: Request,
  opts: ApiRateLimitOptions,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const ip = getClientIp(req);
  const key = `${opts.routeKey}:${ip}`;
  const result = checkRateLimit(key, opts.limit, opts.windowMs);
  if (!result.ok) {
    return { ok: false, retryAfterSec: result.retryAfterSec };
  }
  return { ok: true };
}

export function rejectOversizeJson(req: Request, maxBytes = 32_768): boolean {
  return assertBodyWithinLimit(req.headers.get("content-length"), maxBytes);
}
