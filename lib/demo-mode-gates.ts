/**
 * Demo mode env gates — safe for Edge middleware (no node:crypto).
 */

import type { OrgRole } from "@/app/generated/prisma/client";

export const DEMO_USER_ID = "user_demo_owner";
export const DEMO_ORG_ID = "org_demo_pulsepoint";
export const DEMO_ORG_SLUG = "demo-healthcare";
export const DEMO_ROLE: OrgRole = "OWNER";
export const DEMO_COOKIE_NAME = "pp_demo";
export const DEMO_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export function isDemoModeEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DEMO_MODE !== "true") return false;
  const secret = process.env.DEMO_SESSION_SECRET ?? "";
  if (secret.length < 32) return false;
  return true;
}

export function assertDemoModeNotInProduction(): void {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE === "true") {
    throw new Error(
      "DEMO_MODE_IN_PRODUCTION: refuse to run. Unset DEMO_MODE before deploying.",
    );
  }
}
