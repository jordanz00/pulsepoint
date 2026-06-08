/**
 * Microsoft Entra ID configuration for pilot-entra and hap-azure profiles.
 */

export type EntraConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string | null;
  redirectUri: string;
  defaultOrgSlug: string;
};

export function isEntraConfigured(): boolean {
  return Boolean(
    process.env.ENTRA_TENANT_ID &&
      process.env.ENTRA_CLIENT_ID &&
      process.env.ENTRA_SESSION_SECRET &&
      process.env.ENTRA_SESSION_SECRET.length >= 32,
  );
}

export function getEntraConfig(): EntraConfig | null {
  const tenantId = process.env.ENTRA_TENANT_ID?.trim();
  const clientId = process.env.ENTRA_CLIENT_ID?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  if (!tenantId || !clientId) return null;

  return {
    tenantId,
    clientId,
    clientSecret: process.env.ENTRA_CLIENT_SECRET?.trim() ?? null,
    redirectUri: process.env.ENTRA_REDIRECT_URI?.trim() ?? `${appUrl}/api/auth/entra/callback`,
    defaultOrgSlug: process.env.ENTRA_DEFAULT_ORG_SLUG?.trim() ?? "demo-healthcare",
  };
}

export function entraAuthorizeUrl(tenantId: string): string {
  return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/authorize`;
}

export function entraTokenUrl(tenantId: string): string {
  return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
}

export const ENTRA_SCOPES = ["openid", "profile", "email", "offline_access", "User.Read"] as const;
