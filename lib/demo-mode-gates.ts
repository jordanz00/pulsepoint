/**
 * Demo mode env gates — safe for Edge middleware (no node:crypto).
 */

import type { OrgRole } from "@/app/generated/prisma/client";
import { isEntraIntegrationProfileEnv } from "@/lib/integration-profile-gates";

export const DEMO_USER_ID = "user_demo_owner";
export const DEMO_ORG_ID = "org_demo_pulsepoint";
export const DEMO_ORG_SLUG = "demo-healthcare";
export const DEMO_ROLE: OrgRole = "OWNER";
export const DEMO_COOKIE_NAME = "pp_demo";
export const DEMO_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

/**
 * Hosted stakeholder demo on Vercel Preview only (not customer Production).
 * Requires explicit HOSTED_DEMO=true — never enable on Vercel Production.
 */
export function isHostedDemoPreview(): boolean {
  return (
    process.env.VERCEL_ENV === "preview" && process.env.HOSTED_DEMO === "true"
  );
}

export function isDemoModeEnabled(): boolean {
  // Entra pilot / enterprise profiles never use demo-cookie auth.
  if (isEntraIntegrationProfileEnv()) return false;
  if (process.env.DEMO_MODE !== "true") return false;
  const secret = process.env.DEMO_SESSION_SECRET ?? "";
  if (secret.length < 32) return false;

  if (process.env.NODE_ENV !== "production") return true;
  return isHostedDemoPreview();
}

export function assertDemoModeNotInProduction(): void {
  if (process.env.DEMO_MODE !== "true") return;
  if (isHostedDemoPreview()) return;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DEMO_MODE_IN_PRODUCTION: refuse to run. Use HOSTED_DEMO on Vercel Preview only, or unset DEMO_MODE on Production.",
    );
  }
}
