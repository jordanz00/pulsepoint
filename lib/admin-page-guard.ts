/**
 * Admin page capability guard — enforce RBAC on RSC routes, not only server actions.
 */

import { redirect } from "next/navigation";
import { requireOrgAccessForSlug, type StaffSession } from "@/lib/auth";
import { roleAllows, type Capability } from "@/lib/permissions";

/**
 * Requires org membership plus capability. Redirects staff without access.
 */
export async function requirePageCapability(
  orgSlug: string,
  capability: Capability,
  fallbackPath?: string,
): Promise<StaffSession> {
  const staff = await requireOrgAccessForSlug(orgSlug);
  if (!roleAllows(capability, staff.role)) {
    redirect(fallbackPath ?? `/${orgSlug}`);
  }
  return staff;
}
