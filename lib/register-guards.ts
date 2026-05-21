/**
 * Public registration abuse controls — enumeration, spam, email bombing.
 */

import { checkRateLimit } from "@/lib/rate-limit";

export type RegisterGuardResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; reason: "rate_limit" };

const IP_WINDOW_MS = 60_000;
const IP_LIMIT = 10;
const EMAIL_WINDOW_MS = 3_600_000;
const EMAIL_LIMIT = 5;
const ORG_WINDOW_MS = 3_600_000;
const ORG_LIMIT = 200;

/**
 * Layered limits: per IP, per email (anti bombing), per org (anti spam flood).
 */
export function checkRegistrationGuards(params: {
  ip: string;
  orgId: string;
  guestEmail: string;
}): RegisterGuardResult {
  const ipKey = `register:ip:${params.ip}`;
  const ip = checkRateLimit(ipKey, IP_LIMIT, IP_WINDOW_MS);
  if (!ip.ok) {
    return { ok: false, retryAfterSec: ip.retryAfterSec, reason: "rate_limit" };
  }

  const emailNorm = params.guestEmail.trim().toLowerCase();
  const emailKey = `register:email:${emailNorm}`;
  const email = checkRateLimit(emailKey, EMAIL_LIMIT, EMAIL_WINDOW_MS);
  if (!email.ok) {
    return { ok: false, retryAfterSec: email.retryAfterSec, reason: "rate_limit" };
  }

  const orgKey = `register:org:${params.orgId}`;
  const org = checkRateLimit(orgKey, ORG_LIMIT, ORG_WINDOW_MS);
  if (!org.ok) {
    return { ok: false, retryAfterSec: org.retryAfterSec, reason: "rate_limit" };
  }

  return { ok: true };
}
