import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkProductionSecurityConfig } = await import("@/lib/security/production-guards");
    const guard = checkProductionSecurityConfig();
    if (!guard.ok) {
      console.error("[security] Production guard violations:", guard.violations.join("; "));
      if (process.env.PULSE_STRICT_PRODUCTION_GUARDS === "true") {
        throw new Error("PRODUCTION_SECURITY_GUARD_FAILED");
      }
    }
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
