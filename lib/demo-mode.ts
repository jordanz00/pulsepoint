/**
 * PulsePoint demo mode — prototype/leadership-only auth bypass.
 *
 * Cookie signing uses node:crypto (Node runtime only). Edge middleware must
 * import `@/lib/demo-mode-gates` instead of this file (required for Client
 * Components, middleware, and any code that must not pull in `next/headers`).
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { OrgRole } from "@/app/generated/prisma/client";
import {
  DEMO_COOKIE_MAX_AGE_SECONDS,
  DEMO_COOKIE_NAME,
  DEMO_ORG_ID,
  DEMO_ORG_SLUG,
  DEMO_ROLE,
  DEMO_USER_ID,
  assertDemoModeNotInProduction,
  isDemoModeEnabled,
} from "@/lib/demo-mode-gates";

export {
  DEMO_COOKIE_MAX_AGE_SECONDS,
  DEMO_COOKIE_NAME,
  DEMO_ORG_ID,
  DEMO_ORG_SLUG,
  DEMO_ROLE,
  DEMO_USER_ID,
  isDemoModeEnabled,
};

export type DemoStaffSession = {
  userId: typeof DEMO_USER_ID;
  orgId: typeof DEMO_ORG_ID;
  orgSlug: typeof DEMO_ORG_SLUG;
  role: OrgRole;
  isDemo: true;
};

// Assertion runs at request time inside `getDemoSession()` instead of at
// module import. Module-level fail breaks `next build` page-data collection
// (which always runs in NODE_ENV=production) when developers leave
// DEMO_MODE=true in `.env.local`. Demo cookies are only minted/served via
// `getDemoSession()` and the `/api/demo/*` routes, so request-time assertion
// is the right enforcement point.

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
  exp: number;
};

export function signDemoCookie(now = Date.now()): string {
  // Hard fail when minting a real demo cookie in production — there is no safe
  // case for this. (Reading is gated by isDemoModeEnabled() returning false in
  // production, so passive page rendering can never trip this.)
  assertDemoModeNotInProduction();
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

export async function getDemoSession(): Promise<DemoStaffSession | null> {
  // Read path is gate-protected: isDemoModeEnabled() returns false in
  // production, so passive page rendering (DemoBanner, marketing page,
  // _not-found prerender) silently drops the demo session instead of
  // crashing. Mutation paths (signDemoCookie, /api/demo/start) call
  // assertDemoModeNotInProduction() themselves.
  if (!isDemoModeEnabled()) return null;
  const jar = await cookies();
  const raw = jar.get(DEMO_COOKIE_NAME)?.value;
  if (!verifyDemoCookie(raw)) return null;
  return demoStaffSession();
}
