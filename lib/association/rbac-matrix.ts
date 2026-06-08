/**
 * Department × capability matrix — extends lib/permissions.ts for enterprise RBAC.
 */

import type { AssociationDepartmentId } from "@/lib/association/departments";
import type { Capability } from "@/lib/permissions";

/** Extended capabilities for department-scoped enterprise features */
export type EnterpriseCapability =
  | Capability
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
  | "giving:read"
  | "giving:manage";

import type { OrgRole } from "@/app/generated/prisma/client";

export const ENTERPRISE_CAPABILITY_MIN_ROLE: Record<EnterpriseCapability, OrgRole> = {
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

/** Default capabilities granted per department for STAFF role */
export const DEPARTMENT_DEFAULT_CAPABILITIES: Record<
  AssociationDepartmentId,
  EnterpriseCapability[]
> = {
  executive_office: ["member:read", "analytics:read", "event:read"],
  accounting: ["finance:read", "member:read"],
  advocacy: ["advocacy:read", "advocacy:write", "member:read", "communications:read"],
  business_development: ["deals:read", "deals:write", "member:read", "event:read"],
  communications: ["communications:read", "communications:write", "member:read"],
  education: ["education:read", "education:write", "event:read", "event:write"],
  emergency_management: ["emergency:read", "emergency:write", "member:read", "communications:read"],
  finance_legal: ["finance:read", "giving:read", "member:read", "analytics:read"],
  human_resources: ["member:read", "education:read"],
  information_technology: ["integrations:manage", "org:settings", "automation:resolve"],
  member_services: [
    "member:read",
    "member:write",
    "member:notes",
    "committee:read",
    "committee:write",
    "analytics:read",
  ],
  policy: ["advocacy:read", "advocacy:write", "member:read"],
  quality_initiatives: ["education:read", "analytics:read", "member:read"],
  strategic_analytics: ["analytics:read", "member:read", "member:export"],
  workforce_clinical: ["education:read", "member:read"],
  hapevolve: ["deals:read", "deals:write", "member:read"],
};
