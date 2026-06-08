/**
 * Healthcare facility account types — labels and display order for MemberCore rosters.
 */

import type { MemberOrganizationType } from "@/app/generated/prisma/client";

/** Types shown in the general-member facility roster (clinical members). */
export const CLINICAL_FACILITY_TYPES: MemberOrganizationType[] = [
  "HEALTH_NETWORK",
  "HEALTH_SYSTEM",
  "HOSPITAL",
  "CRITICAL_ACCESS",
  "CANCER_CENTER",
  "PSYCHIATRIC_CENTER",
  "PSYCHIATRIC_INSTITUTE",
  "BEHAVIORAL_HEALTH_CENTER",
  "REHABILITATION_CENTER",
  "SPECIALTY",
];

export const FACILITY_TYPE_LABEL: Record<MemberOrganizationType, string> = {
  HEALTH_NETWORK: "Health networks",
  HEALTH_SYSTEM: "Health systems",
  HOSPITAL: "Hospitals",
  CRITICAL_ACCESS: "Critical access hospitals",
  CANCER_CENTER: "Cancer centers",
  PSYCHIATRIC_CENTER: "Psychiatric centers",
  PSYCHIATRIC_INSTITUTE: "Psychiatric institutes",
  BEHAVIORAL_HEALTH_CENTER: "Behavioral health centers",
  REHABILITATION_CENTER: "Rehabilitation centers",
  SPECIALTY: "Specialty facilities",
  PARTNER: "Partner organizations",
  VENDOR: "Vendors",
  OTHER: "Other accounts",
};

export const FACILITY_TYPE_SINGULAR: Record<MemberOrganizationType, string> = {
  HEALTH_NETWORK: "Health network",
  HEALTH_SYSTEM: "Health system",
  HOSPITAL: "Hospital",
  CRITICAL_ACCESS: "Critical access hospital",
  CANCER_CENTER: "Cancer center",
  PSYCHIATRIC_CENTER: "Psychiatric center",
  PSYCHIATRIC_INSTITUTE: "Psychiatric institute",
  BEHAVIORAL_HEALTH_CENTER: "Behavioral health center",
  REHABILITATION_CENTER: "Rehabilitation center",
  SPECIALTY: "Specialty facility",
  PARTNER: "Partner",
  VENDOR: "Vendor",
  OTHER: "Other",
};

export function facilityTypeSortIndex(type: MemberOrganizationType): number {
  const i = CLINICAL_FACILITY_TYPES.indexOf(type);
  if (i >= 0) return i;
  return CLINICAL_FACILITY_TYPES.length + 1;
}

export function compareFacilityTypes(
  a: MemberOrganizationType,
  b: MemberOrganizationType,
): number {
  return facilityTypeSortIndex(a) - facilityTypeSortIndex(b);
}
