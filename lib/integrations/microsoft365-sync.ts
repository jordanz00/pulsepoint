/**
 * Microsoft 365 sync orchestration — single entry for API routes and server actions.
 */

import {
  getMicrosoft365AccessToken,
  microsoft365Adapter,
  upsertMicrosoft365Connection,
  type Microsoft365SyncResult,
} from "@/lib/adapters/microsoft365";

export async function syncMicrosoft365ForOrg(
  orgId: string,
): Promise<Microsoft365SyncResult> {
  const token = await getMicrosoft365AccessToken(orgId);
  if (!token) {
    throw new Error("M365_NOT_CONNECTED");
  }

  try {
    const result = await microsoft365Adapter.syncAll(token);
    await upsertMicrosoft365Connection(orgId, {
      ...result,
      lastSyncAt: result.syncedAt,
      status: "CONFIGURED",
      scopes: ["Mail.Read", "Calendars.Read", "Contacts.Read", "User.Read"],
    });
    return result;
  } catch {
    await upsertMicrosoft365Connection(orgId, { status: "ERROR" });
    throw new Error("M365_SYNC_FAILED");
  }
}

export async function connectMicrosoft365FromCode(
  orgId: string,
  code: string,
): Promise<void> {
  const tokens = await microsoft365Adapter.exchangeCode(code);
  await upsertMicrosoft365Connection(orgId, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? undefined,
    tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
    status: "CONFIGURED",
    scopes: ["Mail.Read", "Calendars.Read", "Contacts.Read", "User.Read"],
    lastSyncAt: new Date().toISOString(),
  });
}
