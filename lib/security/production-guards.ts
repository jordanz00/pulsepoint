/**
 * Production fail-safes — refuse boot or request when critical secrets missing.
 */

import { isEntraIntegrationProfileEnv } from "@/lib/integration-profile-gates";

export type ProductionGuardResult = {
  ok: boolean;
  violations: string[];
};

/**
 * Verify production-critical security env vars.
 * Called from instrumentation on server start.
 */
export function checkProductionSecurityConfig(): ProductionGuardResult {
  const violations: string[] = [];
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    return { ok: true, violations: [] };
  }

  if (!process.env.CRON_SECRET || process.env.CRON_SECRET.length < 24) {
    violations.push("CRON_SECRET must be set (≥24 chars) in production");
  }

  if (process.env.DEMO_MODE === "true" && process.env.HOSTED_DEMO !== "true") {
    violations.push("DEMO_MODE must not be true in production unless HOSTED_DEMO preview");
  }

  if (process.env.DEMO_MODE === "true" && isEntraIntegrationProfileEnv()) {
    violations.push(
      "DEMO_MODE must not be enabled with INTEGRATION_PROFILE pilot-entra or hap-azure",
    );
  }

  if (isEntraIntegrationProfileEnv()) {
    const entraSecret = process.env.ENTRA_SESSION_SECRET ?? "";
    if (entraSecret.length < 32) {
      violations.push("ENTRA_SESSION_SECRET must be ≥32 chars when Entra profile is active");
    }
  }

  const demoSecret = process.env.DEMO_SESSION_SECRET ?? "";
  if (process.env.DEMO_MODE === "true" && demoSecret.length < 32) {
    violations.push("DEMO_SESSION_SECRET must be ≥32 chars when DEMO_MODE is enabled");
  }

  return { ok: violations.length === 0, violations };
}

/**
 * Fail closed on cron routes when CRON_SECRET is missing in production.
 */
export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 24) return false;
    const auth = req.headers.get("authorization");
    return auth === `Bearer ${secret}`;
  }
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
