import { getEntraConfig } from "@/lib/entra-config";
import type { GraphConfig } from "@/lib/adapters/microsoft365/types";

export function getMicrosoft365Config(): GraphConfig | null {
  const entra = getEntraConfig();
  const clientId =
    process.env.MICROSOFT_GRAPH_CLIENT_ID?.trim() ?? entra?.clientId;
  const tenantId =
    process.env.MICROSOFT_GRAPH_TENANT_ID?.trim() ?? entra?.tenantId;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  if (!clientId || !tenantId) return null;

  return {
    clientId,
    clientSecret:
      process.env.MICROSOFT_GRAPH_CLIENT_SECRET?.trim() ?? entra?.clientSecret ?? null,
    redirectUri:
      process.env.MICROSOFT_GRAPH_REDIRECT_URI?.trim() ??
      `${appUrl}/api/integrations/microsoft/callback`,
    tenantId,
  };
}

export function isMicrosoft365Configured(): boolean {
  return getMicrosoft365Config() !== null;
}

export function microsoftTokenUrl(tenantId: string): string {
  return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
}

export function microsoftAuthorizeUrl(tenantId: string): string {
  return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/authorize`;
}
