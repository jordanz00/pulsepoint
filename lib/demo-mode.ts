/**
 * PulsePoint demo mode — prototype/leadership-only auth bypass.
 *
 * Cookie signing uses node:crypto (Node runtime only). Edge middleware must
 * import `@/lib/demo-mode-gates` instead of this file.
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
  exp: number;
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

export async function getDemoSession(): Promise<DemoStaffSession | null> {
  if (!isDemoModeEnabled()) return null;
  const jar = await cookies();
  const raw = jar.get(DEMO_COOKIE_NAME)?.value;
  if (!verifyDemoCookie(raw)) return null;
  return demoStaffSession();
}
