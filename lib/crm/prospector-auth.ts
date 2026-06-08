/**
 * Prospector API auth — same capture tokens as web capture.
 */

import { prisma } from "@/lib/prisma";
import { hashCaptureToken } from "@/lib/crm/web-capture";

export type ProspectorAuth = {
  orgId: string;
  orgSlug: string;
};

export async function verifyProspectorHeaders(
  req: Request,
): Promise<ProspectorAuth | { error: string; status: number }> {
  const orgId = req.headers.get("x-pulsepoint-org-id");
  const token = req.headers.get("x-pulsepoint-capture-token");

  if (!orgId || !token) {
    return { error: "Missing org id or capture token", status: 401 };
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return { error: "Unknown organization", status: 404 };

  const keyHash = hashCaptureToken(token);
  const key = await prisma.webCaptureKey.findFirst({
    where: { orgId, keyHash, active: true },
  });
  if (!key) return { error: "Invalid capture token", status: 401 };

  return { orgId: org.id, orgSlug: org.slug };
}
