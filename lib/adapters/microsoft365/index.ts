/**
 * Microsoft 365 adapter — Graph mail, calendar, contacts for association staff.
 *
 * Application code should use this module or lib/integrations/microsoft365-sync.ts,
 * not call Graph URLs directly.
 */

import {
  getMicrosoft365Config,
  isMicrosoft365Configured,
  microsoftAuthorizeUrl,
  microsoftTokenUrl,
} from "@/lib/adapters/microsoft365/config";
import { M365_SCOPE_STRING } from "@/lib/adapters/microsoft365/scopes";
import { fetchMailThreads } from "@/lib/adapters/microsoft365/capabilities/mail";
import { fetchCalendarEvents } from "@/lib/adapters/microsoft365/capabilities/calendar";
import { fetchContacts } from "@/lib/adapters/microsoft365/capabilities/contacts";
import type {
  Microsoft365Adapter,
  Microsoft365SyncResult,
} from "@/lib/adapters/microsoft365/types";

async function tokenRequest(body: URLSearchParams): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
}> {
  const cfg = getMicrosoft365Config();
  if (!cfg) throw new Error("M365_NOT_CONFIGURED");

  const res = await fetch(microsoftTokenUrl(cfg.tenantId), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? "m365_token_failed");
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresIn: data.expires_in ?? 3600,
  };
}

export const microsoft365Adapter: Microsoft365Adapter = {
  id: "microsoft365",

  isConfigured() {
    return isMicrosoft365Configured();
  },

  getAuthorizeUrl(state: string) {
    const cfg = getMicrosoft365Config()!;
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      response_type: "code",
      redirect_uri: cfg.redirectUri,
      scope: M365_SCOPE_STRING,
      state,
      response_mode: "query",
    });
    return `${microsoftAuthorizeUrl(cfg.tenantId)}?${params}`;
  },

  async exchangeCode(code: string) {
    const cfg = getMicrosoft365Config()!;
    const body = new URLSearchParams({
      client_id: cfg.clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: cfg.redirectUri,
      scope: M365_SCOPE_STRING,
    });
    if (cfg.clientSecret) body.set("client_secret", cfg.clientSecret);
    return tokenRequest(body);
  },

  async refreshToken(refreshToken: string) {
    const cfg = getMicrosoft365Config()!;
    const body = new URLSearchParams({
      client_id: cfg.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: M365_SCOPE_STRING,
    });
    if (cfg.clientSecret) body.set("client_secret", cfg.clientSecret);
    return tokenRequest(body);
  },

  async syncAll(accessToken: string): Promise<Microsoft365SyncResult> {
    const [mailThreads, calendarEvents, contacts] = await Promise.all([
      fetchMailThreads(accessToken, 15),
      fetchCalendarEvents(accessToken, 10),
      fetchContacts(accessToken, 20),
    ]);
    return {
      mailThreads,
      calendarEvents,
      contacts,
      syncedAt: new Date().toISOString(),
    };
  },
};

export { getMicrosoft365Config, isMicrosoft365Configured } from "@/lib/adapters/microsoft365/config";
export {
  getMicrosoft365Connection,
  upsertMicrosoft365Connection,
  getMicrosoft365AccessToken,
} from "@/lib/adapters/microsoft365/connection-store";

export type {
  GraphMailThread,
  GraphCalendarEvent,
  GraphContact,
  Microsoft365SyncResult,
  Microsoft365ConnectionConfig,
} from "@/lib/adapters/microsoft365/types";
