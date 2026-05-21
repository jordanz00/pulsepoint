/**
 * PulsePoint demo mode — prototype/leadership-only auth bypass.
 *
 * WHO THIS IS FOR: Anyone running the local prototype or a non-production
 * preview where Clerk auth would otherwise block click-through. Demo mode
 * signs you in as the seeded owner of the demo org (`demo-healthcare`).
 *
 * WHAT IT DOES:
 *   1. Refuses to activate when NODE_ENV === "production" (hard fail).
 *   2. Requires DEMO_MODE=true and a DEMO_SESSION_SECRET (>= 32 chars).
 *   3. Issues an HMAC-signed cookie that maps to a fixed staff session:
 *        user_demo_owner / org_demo_pulsepoint / OWNER.
 *   4. Is read by `requireStaffSession` and `requireOrgAccessForSlug` in
 *      `lib/auth.ts` BEFORE Clerk is consulted.
 *
 * SAFETY:
 *   - Triple gate (NODE_ENV check, env flag, signed cookie).
 *   - Cookie is HMAC-SHA256 signed; an attacker on a deployed prototype
 *     cannot forge it without the server secret.
 *   - The "demo user" is the same fixed seed identity for everyone — there
 *     is no way to impersonate a real Clerk user.
 *   - Audit log written on every enter/exit (see app/api/demo/*).
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { OrgRole } from "@/app/generated/prisma/client";

export const DEMO_USER_ID = "user_demo_owner";
export const DEMO_ORG_ID = "org_demo_pulsepoint";
export const DEMO_ORG_SLUG = "demo-healthcare";
export const DEMO_ROLE: OrgRole = "OWNER";
export const DEMO_COOKIE_NAME = "pp_demo";
export const DEMO_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

export type DemoStaffSession = {
  userId: typeof DEMO_USER_ID;
  orgId: typeof DEMO_ORG_ID;
  orgSlug: typeof DEMO_ORG_SLUG;
  role: OrgRole;
  isDemo: true;
};

/** Returns true only when demo mode is safe to honor in this environment. */
export function isDemoModeEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DEMO_MODE !== "true") return false;
  const secret = process.env.DEMO_SESSION_SECRET ?? "";
  if (secret.length < 32) return false;
  return true;
}

/**
 * Hard refusal: production with DEMO_MODE=true is a config mistake.
 * Throws synchronously on import-time if mis-set.
 */
export function assertDemoModeNotInProduction(): void {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE === "true") {
    throw new Error(
      "DEMO_MODE_IN_PRODUCTION: refuse to run. Unset DEMO_MODE before deploying.",
    );
  }
}

assertDemoModeNotInProduction();

function getSecret(): string {
  const s = process.env.DEMO_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("DEMO_SESSION_SECRET missing or too short (>=32 chars).");
  }
  return s;
}

function base64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const std = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(std, "base64");
}

type DemoCookiePayload = {
  v: 1;
  exp: number; // unix seconds
};

export function signDemoCookie(now = Date.now()): string {
  const payload: DemoCookiePayload = {
    v: 1,
    exp: Math.floor(now / 1000) + DEMO_COOKIE_MAX_AGE_SECONDS,
  };
  const payloadB64 = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest();
  return `${payloadB64}.${base64url(sig)}`;
}

export function verifyDemoCookie(raw: string | undefined, now = Date.now()): boolean {
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64!)
    .digest();
  let providedSig: Buffer;
  try {
    providedSig = base64urlDecode(sigB64!);
  } catch {
    return false;
  }
  if (providedSig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return false;
  let payload: DemoCookiePayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64!).toString("utf8"));
  } catch {
    return false;
  }
  if (payload.v !== 1) return false;
  if (typeof payload.exp !== "number") return false;
  if (payload.exp * 1000 < now) return false;
  return true;
}

export function demoStaffSession(): DemoStaffSession {
  return {
    userId: DEMO_USER_ID,
    orgId: DEMO_ORG_ID,
    orgSlug: DEMO_ORG_SLUG,
    role: DEMO_ROLE,
    isDemo: true,
  };
}

/**
 * Returns the demo session if (a) demo mode is enabled and (b) the request
 * carries a valid signed cookie. Otherwise null.
 */
export async function getDemoSession(): Promise<DemoStaffSession | null> {
  if (!isDemoModeEnabled()) return null;
  const jar = await cookies();
  const raw = jar.get(DEMO_COOKIE_NAME)?.value;
  if (!verifyDemoCookie(raw)) return null;
  return demoStaffSession();
}
