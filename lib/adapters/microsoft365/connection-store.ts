/**
 * Org-scoped Microsoft 365 token + sync payload on IntegrationConnection.
 */

import { prisma } from "@/lib/prisma";
import type { Microsoft365ConnectionConfig } from "@/lib/adapters/microsoft365/types";
import { microsoft365Adapter } from "@/lib/adapters/microsoft365/index";

export async function getMicrosoft365Connection(orgId: string) {
  return prisma.integrationConnection.findUnique({
    where: { orgId_vendor: { orgId, vendor: "MICROSOFT_365" } },
  });
}

export async function upsertMicrosoft365Connection(
  orgId: string,
  patch: Microsoft365ConnectionConfig & {
    status?: "CONFIGURED" | "PENDING" | "ERROR";
  },
) {
  const existing = await getMicrosoft365Connection(orgId);
  const prev = (existing?.config ?? {}) as Microsoft365ConnectionConfig;
  const config = { ...prev, ...patch };

  return prisma.integrationConnection.upsert({
    where: { orgId_vendor: { orgId, vendor: "MICROSOFT_365" } },
    create: {
      orgId,
      vendor: "MICROSOFT_365",
      status: patch.status ?? "CONFIGURED",
      config: config as object,
      lastSyncAt: patch.lastSyncAt ? new Date(patch.lastSyncAt) : new Date(),
    },
    update: {
      status: patch.status ?? "CONFIGURED",
      config: config as object,
      lastSyncAt: patch.lastSyncAt ? new Date(patch.lastSyncAt) : new Date(),
    },
  });
}

export async function getMicrosoft365AccessToken(orgId: string): Promise<string | null> {
  const row = await getMicrosoft365Connection(orgId);
  const cfg = (row?.config ?? {}) as Microsoft365ConnectionConfig;
  if (!cfg.refreshToken && !cfg.accessToken) return null;

  const expiresAt = cfg.tokenExpiresAt ? new Date(cfg.tokenExpiresAt).getTime() : 0;
  if (cfg.accessToken && expiresAt > Date.now() + 60_000) {
    return cfg.accessToken;
  }
  if (!cfg.refreshToken) return cfg.accessToken ?? null;

  const refreshed = await microsoft365Adapter.refreshToken(cfg.refreshToken);
  await upsertMicrosoft365Connection(orgId, {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? cfg.refreshToken,
    tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
  });
  return refreshed.accessToken;
}
