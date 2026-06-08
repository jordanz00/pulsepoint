/**
 * Roles and permissions (RBAC).
 *
 * WHO THIS IS FOR: API + web — single source of truth for "who can do what".
 * WHAT IT DOES: Lists roles, maps actions → minimum role, exposes hasPermission().
 * HOW IT CONNECTS: Imported by api/src/lib/auth-context.ts (assertPermission) and
 *   by web for UI gating. New permissions MUST be added here; never inline strings
 *   without an entry in PERMISSIONS.
 */

export const ROLES = [
  "VIEWER",
  "TRAFFICKER",
  "MLR_REVIEWER",
  "OPS_LEAD",
  "ADMIN",
] as const;

export type Role = (typeof ROLES)[number];

/**
 * Action → minimum role required.
 *
 * Add new permissions here. Use the convention `<resource>:<verb>` e.g.
 * `campaign:read`, `sync:read`, `pacing:run`. The API enforces these via
 * `assertPermission()`; the web UI mirrors them for affordance/visibility.
 */
export const PERMISSIONS: Record<string, Role> = {
  "campaign:read": "VIEWER",
  "campaign:edit_draft": "TRAFFICKER",
  "campaign:transition_qa": "OPS_LEAD",
  "campaign:ready_to_traffic": "OPS_LEAD",
  "campaign:sync": "TRAFFICKER",
  "campaign:edit_live": "ADMIN",
  "creative:read": "VIEWER",
  "creative:mlr_approve": "MLR_REVIEWER",
  "creative:lock": "OPS_LEAD",
  "creative:traffic": "OPS_LEAD",
  "creative:go_live": "OPS_LEAD",
  "creative:retire": "OPS_LEAD",
  "audience:validate": "TRAFFICKER",
  "reconciliation:run": "OPS_LEAD",
  "audit:read": "VIEWER",
  "sync:read": "VIEWER",
  "pacing:run": "OPS_LEAD",
};

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  TRAFFICKER: 1,
  MLR_REVIEWER: 2,
  OPS_LEAD: 3,
  ADMIN: 4,
};

/**
 * Check whether a role satisfies an action's minimum-role requirement.
 *
 * WHO THIS IS FOR: any caller needing a yes/no permission check.
 * WHAT IT DOES: Looks up the required role for `action`; returns false if
 *   the action is unknown (deny-by-default) or if the caller's rank is too low.
 *
 * @param userRole role of the authenticated actor
 * @param action permission key from PERMISSIONS
 * @returns true if allowed, false otherwise
 */
export function hasPermission(userRole: Role, action: string): boolean {
  const required = PERMISSIONS[action];
  if (!required) return false;
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}
