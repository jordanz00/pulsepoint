/**
 * Capability-based permissions — enforced in server actions (not UI-only).
 *
 * WHO: All staff-facing mutations and exports
 * WHAT: Maps capabilities to minimum OrgRole; throws FORBIDDEN when insufficient
 * HOW: requireCapability('member:export') before CSV export, etc.
 */

import type { OrgRole } from "@/app/generated/prisma/client";
import {
  assertOrgSlugForStaff,
  hasMinRole,
  requireStaffSession,
  type StaffSession,
} from "@/lib/auth";

export type Capability =
  | "member:read"
  | "member:write"
  | "member:export"
  | "member:import"
  | "member:delete"
  | "member:notes"
  | "event:read"
  | "event:write"
  | "event:delete"
  | "event:checkin"
  | "org:settings"
  | "automation:resolve";

/** Minimum role per capability — documented in docs/DATA-DICTIONARY.md */
export const CAPABILITY_MIN_ROLE: Record<Capability, OrgRole> = {
  "member:read": "STAFF",
  "member:write": "STAFF",
  "member:notes": "STAFF",
  "member:export": "ADMIN",
  "member:import": "ADMIN",
  "member:delete": "ADMIN",
  "event:read": "STAFF",
  "event:write": "STAFF",
  "event:checkin": "STAFF",
  "event:delete": "ADMIN",
  "org:settings": "ADMIN",
  "automation:resolve": "ADMIN",
};

export function roleAllows(capability: Capability, role: OrgRole): boolean {
  return hasMinRole(role, CAPABILITY_MIN_ROLE[capability]);
}

/**
 * Requires signed-in staff with capability. Use instead of requireStaffSession on sensitive paths.
 */
export type RequireCapabilityOptions = {
  /** URL org slug from page — must match Clerk active org */
  orgSlug?: string;
};

export async function requireCapability(
  capability: Capability,
  options?: RequireCapabilityOptions,
): Promise<StaffSession> {
  const staff = await requireStaffSession();
  assertOrgSlugForStaff(staff, options?.orgSlug);
  if (!roleAllows(capability, staff.role)) {
    throw new Error("FORBIDDEN");
  }
  return staff;
}
