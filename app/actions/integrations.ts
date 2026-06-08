"use server";

import { requireOrgAccessForSlug } from "@/lib/auth";
import { requireCapability } from "@/lib/permissions";
import { upsertEasyDnnSiteConfig, type EasyDnnSiteConfig } from "@/lib/adapters/cms";
import { publishMemberDirectoryToEasyDnn } from "@/lib/integrations/easydnn-publish";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function saveEasyDnnSiteConfig(
  orgSlug: string,
  input: {
    siteUrl: string;
    portalId?: number;
    eventsPagePath?: string;
    memberDirectoryPath?: string;
    registrationMode?: "pulsepoint" | "dnn_redirect";
  },
) {
  try {
    const staff = await requireCapability("integrations:manage", { orgSlug });
    const siteUrl = input.siteUrl.trim().replace(/\/$/, "");
    if (!siteUrl.startsWith("https://")) {
      return { ok: false as const, error: "Site URL must start with https://" };
    }

    const config: EasyDnnSiteConfig = {
      siteUrl,
      portalId: input.portalId,
      eventsPagePath: input.eventsPagePath,
      memberDirectoryPath: input.memberDirectoryPath,
      registrationMode: input.registrationMode ?? "pulsepoint",
      lastPublishedAt: new Date().toISOString(),
    };

    await upsertEasyDnnSiteConfig(staff.orgId, config);
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "integration.easydnn.config",
      entity: "IntegrationConnection",
      entityId: "EASYDNN",
    });

    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Save failed" };
  }
}

export async function exportMemberDirectoryToEasyDnn(orgSlug: string) {
  try {
    const staff = await requireOrgAccessForSlug(orgSlug);
    const org = await prisma.organization.findUnique({ where: { id: staff.orgId } });
    if (!org) return { ok: false as const, error: "Org not found" };

    const bundle = await publishMemberDirectoryToEasyDnn(staff.orgId, org.name);
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "integration.easydnn.member_directory",
      entity: "Organization",
      entityId: org.id,
    });

    return { ok: true as const, bundle };
  } catch {
    return { ok: false as const, error: "Export failed" };
  }
}
