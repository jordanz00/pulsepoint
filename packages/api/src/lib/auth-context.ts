/**
 * Request actor context — who is calling this API.
 *
 * WHO THIS IS FOR: route handlers + services that need to know which user
 *   (or service principal) is performing an action.
 * WHAT IT DOES: Defines RequestActor, the `assertPermission` guard, and a
 *   small role-coercion helper for the Prisma UserRole enum.
 * HOW IT CONNECTS: plugins/auth.ts populates req.actor; routes call
 *   assertPermission(req.actor, "<action>") before mutating state.
 */

import { hasPermission, type Role } from "@ams/shared";
import { Errors } from "./errors.js";

/** Local alias matching Prisma UserRole — avoids cross-package client confusion. */
type UserRole = string;

export interface RequestActor {
  id: string;
  email: string;
  role: Role;
  /** Auth mode that produced this actor — useful for audit trails. */
  authMode: "dev" | "entra";
  /** Original Entra `oid` claim when authMode === "entra". */
  oid?: string;
}

/**
 * Throw 403 if the actor cannot perform `action`.
 *
 * WHO THIS IS FOR: route handlers + services.
 * WHAT IT DOES: Looks up the permission via shared roles.PERMISSIONS;
 *   throws AmsError(AMS_PERM_005, 403) on denial.
 *
 * @param actor authenticated request actor
 * @param action permission key (e.g. "campaign:read")
 */
export function assertPermission(actor: RequestActor, action: string): void {
  if (!hasPermission(actor.role, action)) {
    throw Errors.forbidden(`Role ${actor.role} cannot perform ${action}`);
  }
}

/**
 * Coerce a Prisma UserRole enum value into the shared Role union.
 *
 * @param role Prisma-side enum value
 * @returns same value typed as shared Role
 */
export function roleFromDb(role: UserRole): Role {
  return role as Role;
}
