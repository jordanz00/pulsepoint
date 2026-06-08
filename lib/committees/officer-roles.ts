/**
 * Committee officer roles — governance titles and display order.
 */

export const COMMITTEE_OFFICER_ROLES = [
  { value: "CHAIR", label: "Chair", isOfficer: true, sortOrder: 1 },
  { value: "VICE_CHAIR", label: "Vice chair", isOfficer: true, sortOrder: 2 },
  { value: "SECRETARY", label: "Secretary", isOfficer: true, sortOrder: 3 },
  { value: "TREASURER", label: "Treasurer", isOfficer: true, sortOrder: 4 },
  { value: "MEMBER_AT_LARGE", label: "Member at large", isOfficer: true, sortOrder: 5 },
  { value: "MEMBER", label: "Member", isOfficer: false, sortOrder: 99 },
] as const;

export type CommitteeOfficerRoleValue =
  (typeof COMMITTEE_OFFICER_ROLES)[number]["value"];

const BY_VALUE = Object.fromEntries(
  COMMITTEE_OFFICER_ROLES.map((r) => [r.value, r]),
) as Record<CommitteeOfficerRoleValue, (typeof COMMITTEE_OFFICER_ROLES)[number]>;

export function officerRoleLabel(role: string): string {
  return BY_VALUE[role as CommitteeOfficerRoleValue]?.label ?? role;
}

export function isOfficerRole(role: string): boolean {
  return BY_VALUE[role as CommitteeOfficerRoleValue]?.isOfficer ?? false;
}

export function titleForOfficerRole(role: CommitteeOfficerRoleValue): string {
  return officerRoleLabel(role);
}

export function officerSortOrder(role: string): number {
  return BY_VALUE[role as CommitteeOfficerRoleValue]?.sortOrder ?? 50;
}

/** Only one active chair per committee. */
export function requiresChairDemotion(role: string): boolean {
  return role === "CHAIR";
}
