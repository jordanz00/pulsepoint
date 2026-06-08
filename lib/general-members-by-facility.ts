/**
 * Active general membership accounts grouped by healthcare facility type and account name.
 */

import { getOrgDb } from "@/lib/db";
import {
  CLINICAL_FACILITY_TYPES,
  FACILITY_TYPE_LABEL,
  compareFacilityTypes,
} from "@/lib/facility-organization";
import { membershipClassFromTierName } from "@/lib/membership-class";
import type { MemberOrganizationType } from "@/app/generated/prisma/client";

export type GeneralMemberFacilityRow = {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  jobTitle: string | null;
  tierName: string | null;
};

export type GeneralMemberFacilityAccount = {
  id: string;
  name: string;
  region: string | null;
  type: MemberOrganizationType;
  members: GeneralMemberFacilityRow[];
};

export type GeneralMemberFacilityTypeGroup = {
  facilityType: MemberOrganizationType;
  typeLabel: string;
  facilityCount: number;
  memberCount: number;
  facilities: GeneralMemberFacilityAccount[];
};

export type GeneralMembersByFacilitySnapshot = {
  dataAsOf: Date;
  totalGeneralActive: number;
  onRoster: number;
  unassigned: GeneralMemberFacilityRow[];
  typeGroups: GeneralMemberFacilityTypeGroup[];
};

export async function loadGeneralMembersByFacility(
  orgId: string,
): Promise<GeneralMembersByFacilitySnapshot> {
  const db = getOrgDb(orgId);
  const now = new Date();

  const members = await db.member.findMany({
    where: { orgId, status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      jobTitle: true,
      organizationAccountId: true,
      tier: { select: { name: true } },
      organizationAccount: {
        select: { id: true, name: true, region: true, type: true },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const general = members.filter(
    (m) => membershipClassFromTierName(m.tier?.name) === "general",
  );

  const unassigned: GeneralMemberFacilityRow[] = [];
  const byAccount = new Map<
    string,
    GeneralMemberFacilityAccount & { type: MemberOrganizationType }
  >();

  for (const m of general) {
    const row: GeneralMemberFacilityRow = {
      memberId: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      jobTitle: m.jobTitle,
      tierName: m.tier?.name ?? null,
    };

    if (!m.organizationAccount) {
      unassigned.push(row);
      continue;
    }

    const acc = m.organizationAccount;
    let bucket = byAccount.get(acc.id);
    if (!bucket) {
      bucket = {
        id: acc.id,
        name: acc.name,
        region: acc.region,
        type: acc.type,
        members: [],
      };
      byAccount.set(acc.id, bucket);
    }
    bucket.members.push(row);
  }

  const byType = new Map<MemberOrganizationType, GeneralMemberFacilityAccount[]>();

  for (const account of byAccount.values()) {
    if (!CLINICAL_FACILITY_TYPES.includes(account.type)) continue;
    const list = byType.get(account.type) ?? [];
    list.push({
      id: account.id,
      name: account.name,
      region: account.region,
      type: account.type,
      members: account.members,
    });
    byType.set(account.type, list);
  }

  for (const list of byType.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const typeGroups: GeneralMemberFacilityTypeGroup[] = CLINICAL_FACILITY_TYPES.filter(
    (t) => (byType.get(t)?.length ?? 0) > 0,
  )
    .sort(compareFacilityTypes)
    .map((facilityType) => {
      const facilities = byType.get(facilityType) ?? [];
      const memberCount = facilities.reduce((n, f) => n + f.members.length, 0);
      return {
        facilityType,
        typeLabel: FACILITY_TYPE_LABEL[facilityType],
        facilityCount: facilities.length,
        memberCount,
        facilities,
      };
    });

  const onRoster = general.length - unassigned.length;

  return {
    dataAsOf: now,
    totalGeneralActive: general.length,
    onRoster,
    unassigned,
    typeGroups,
  };
}
