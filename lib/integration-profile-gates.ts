/**
 * Integration profile env gates — Edge-safe (no Node crypto).
 */

export function integrationProfileEnv(): string {
  return process.env.INTEGRATION_PROFILE?.trim().toLowerCase() ?? "";
}

export function isEntraIntegrationProfileEnv(): boolean {
  const raw = integrationProfileEnv();
  return (
    raw === "pilot-entra" ||
    raw === "pilot_entra" ||
    raw === "hap-azure" ||
    raw === "hap_azure" ||
    raw === "hap"
  );
}

/** True when middleware should use Entra session cookies instead of Clerk. */
export function isEntraPilotMiddlewareEnv(): boolean {
  if (!isEntraIntegrationProfileEnv()) return false;
  const secret = process.env.ENTRA_SESSION_SECRET ?? "";
  return secret.length >= 32;
}
