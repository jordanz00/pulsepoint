/**
 * Staff role assignment policy — who may change which OrgRole values.
 */

import type { OrgRole } from "@/app/generated/prisma/client";

const ROLE_RANK: Record<OrgRole, number> = {
  STAFF: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function assignableRoles(actorRole: OrgRole): OrgRole[] {
  if (actorRole === "OWNER") return ["STAFF", "ADMIN", "OWNER"];
  if (actorRole === "ADMIN") return ["STAFF", "ADMIN"];
  return [];
}

export function canAssignRole(
  actorRole: OrgRole,
  targetCurrentRole: OrgRole,
  nextRole: OrgRole,
  ownerCount: number,
): { ok: true } | { ok: false; reason: string } {
  if (!assignableRoles(actorRole).includes(nextRole)) {
    return { ok: false, reason: "You cannot assign that role" };
  }
  if (actorRole === "ADMIN" && targetCurrentRole === "OWNER") {
    return { ok: false, reason: "Only an owner can change owner access" };
  }
  if (actorRole === "ADMIN" && nextRole === "OWNER") {
    return { ok: false, reason: "Only an owner can grant owner access" };
  }
  if (
    targetCurrentRole === "OWNER" &&
    nextRole !== "OWNER" &&
    ownerCount <= 1
  ) {
    return { ok: false, reason: "Organization must keep at least one owner" };
  }
  if (ROLE_RANK[nextRole] > ROLE_RANK[actorRole]) {
    return { ok: false, reason: "You cannot grant a role above your own" };
  }
  return { ok: true };
}
