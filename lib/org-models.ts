/** Models that MUST be filtered by orgId on every query */

export const ORG_SCOPED_MODELS = [
  "OrgMembership",
  "Member",
  "MemberTier",
  "Event",
  "EventRegistration",
  "AuditLog",
] as const;

export type OrgScopedModel = (typeof ORG_SCOPED_MODELS)[number];

export function isOrgScopedModel(model: string): model is OrgScopedModel {
  return (ORG_SCOPED_MODELS as readonly string[]).includes(model);
}
