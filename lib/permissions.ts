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
  | "automation:resolve"
  | "advocacy:read"
  | "advocacy:write"
  | "education:read"
  | "education:write"
  | "emergency:read"
  | "emergency:write"
  | "communications:read"
  | "communications:write"
  | "analytics:read"
  | "finance:read"
  | "deals:read"
  | "deals:write"
  | "integrations:manage"
  | "committee:read"
  | "committee:write"
  | "learn:manage"
  | "commerce:manage"
  | "commerce:export"
  | "giving:read"
  | "giving:manage"
  | "engage:manage"
  | "engage:send"
  | "insights:export";

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
  "advocacy:read": "STAFF",
  "advocacy:write": "STAFF",
  "education:read": "STAFF",
  "education:write": "STAFF",
  "emergency:read": "STAFF",
  "emergency:write": "ADMIN",
  "communications:read": "STAFF",
  "communications:write": "STAFF",
  "analytics:read": "STAFF",
  "finance:read": "ADMIN",
  "deals:read": "STAFF",
  "deals:write": "STAFF",
  "integrations:manage": "ADMIN",
  "committee:read": "STAFF",
  "committee:write": "ADMIN",
  "learn:manage": "STAFF",
  "commerce:manage": "ADMIN",
  "commerce:export": "ADMIN",
  "giving:read": "STAFF",
  "giving:manage": "ADMIN",
  "engage:manage": "STAFF",
  "engage:send": "ADMIN",
  "insights:export": "ADMIN",
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
