/**
 * EasyDNN site configuration on IntegrationConnection (vendor EASYDNN).
 */

import { prisma } from "@/lib/prisma";
import type { EasyDnnSiteConfig } from "@/lib/adapters/cms/types";

export async function getEasyDnnConnection(orgId: string) {
  return prisma.integrationConnection.findUnique({
    where: { orgId_vendor: { orgId, vendor: "EASYDNN" } },
  });
}

export async function getEasyDnnSiteConfig(orgId: string): Promise<EasyDnnSiteConfig | null> {
  const row = await getEasyDnnConnection(orgId);
  if (!row?.config) return null;
  const cfg = row.config as EasyDnnSiteConfig;
  return cfg.siteUrl ? cfg : null;
}

export async function upsertEasyDnnSiteConfig(
  orgId: string,
  config: EasyDnnSiteConfig,
): Promise<void> {
  await prisma.integrationConnection.upsert({
    where: { orgId_vendor: { orgId, vendor: "EASYDNN" } },
    create: {
      orgId,
      vendor: "EASYDNN",
      status: "CONFIGURED",
      config: config as object,
      lastSyncAt: new Date(),
    },
    update: {
      status: "CONFIGURED",
      config: config as object,
      lastSyncAt: new Date(),
    },
  });
}
