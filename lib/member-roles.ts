/**
 * Member roles — labels and display helpers for leadership / governance records.
 *
 * WHO: Staff viewing MemberCore directory and member profiles.
 * WHAT: Maps enum values to plain English; builds one-line summaries for tables.
 */

import type {
  LeadershipLevel,
  MemberRoleCategory,
  MemberRoleScope,
} from "@/app/generated/prisma/client";

export const LEADERSHIP_LEVEL_LABELS: Record<LeadershipLevel, string> = {
  C_SUITE: "C-Suite",
  SENIOR_EXECUTIVE: "Senior executive",
  DIRECTOR: "Director",
  MANAGER: "Manager",
  PROFESSIONAL: "Professional",
  OTHER: "Other",
};

export const ROLE_CATEGORY_LABELS: Record<MemberRoleCategory, string> = {
  EXECUTIVE: "Executive",
  BOARD: "Board",
  COMMITTEE: "Committee",
  CHAPTER: "Chapter / region",
  STAFF: "Staff",
  OTHER: "Other",
};

export const ROLE_SCOPE_LABELS: Record<MemberRoleScope, string> = {
  THIS_ASSOCIATION: "This association",
  EXTERNAL_ORGANIZATION: "External organization",
};

export type MemberRoleRow = {
  id: string;
  category: MemberRoleCategory;
  scope: MemberRoleScope;
  leadershipLevel: LeadershipLevel | null;
  title: string;
  organizationName: string | null;
  isCurrent: boolean;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
};

/**
 * One-line label for a single role (e.g. "C-Suite · CEO · This association").
 */
export function formatMemberRoleLine(role: MemberRoleRow): string {
  const parts: string[] = [];
  if (role.leadershipLevel) {
    parts.push(LEADERSHIP_LEVEL_LABELS[role.leadershipLevel]);
  }
  parts.push(role.title);
  if (role.scope === "EXTERNAL_ORGANIZATION" && role.organizationName) {
    parts.push(`@ ${role.organizationName}`);
  } else if (role.scope === "THIS_ASSOCIATION") {
    parts.push(`(${ROLE_SCOPE_LABELS.THIS_ASSOCIATION})`);
  }
  if (!role.isCurrent) parts.push("(former)");
  return parts.join(" · ");
}

/**
 * Short summary for directory table — current roles only, max 2 lines.
 */
export function summarizeMemberRoles(roles: MemberRoleRow[]): string {
  const current = roles.filter((r) => r.isCurrent);
  if (current.length === 0) return "—";
  const lines = current.slice(0, 2).map(formatMemberRoleLine);
  if (current.length > 2) lines.push(`+${current.length - 2} more`);
  return lines.join("; ");
}

export function memberHasCSuite(roles: MemberRoleRow[]): boolean {
  return roles.some(
    (r) => r.isCurrent && r.leadershipLevel === "C_SUITE",
  );
}

export function memberHasExternalBoard(roles: MemberRoleRow[]): boolean {
  return roles.some(
    (r) =>
      r.isCurrent &&
      r.category === "BOARD" &&
      r.scope === "EXTERNAL_ORGANIZATION",
  );
}

export function memberHasOurBoard(roles: MemberRoleRow[]): boolean {
  return roles.some(
    (r) =>
      r.isCurrent && r.category === "BOARD" && r.scope === "THIS_ASSOCIATION",
  );
}

/** Common executive titles for quick-pick in role forms. */
export const EXECUTIVE_TITLE_SUGGESTIONS = [
  "CEO",
  "President & CEO",
  "CFO",
  "COO",
  "CMO",
  "CNO",
  "Chief Medical Officer",
  "Chief Nursing Officer",
  "Board Chair",
  "Board Vice Chair",
  "Trustee",
  "Board Member",
  "Committee Chair",
  "Committee Vice Chair",
  "Administrator",
  "Executive Director",
] as const;

export type RoleBadgeKind =
  | "c_suite"
  | "our_board"
  | "external_board"
  | "committee"
  | "executive"
  | "staff"
  | "former";

export type RoleBadge = {
  kind: RoleBadgeKind;
  label: string;
  detail?: string;
};

/**
 * Derive compact badges for directory rows and profile headers.
 */
export function roleBadgesForMember(roles: MemberRoleRow[]): RoleBadge[] {
  const current = roles.filter((r) => r.isCurrent);
  const badges: RoleBadge[] = [];

  for (const role of current) {
    if (role.leadershipLevel === "C_SUITE") {
      badges.push({
        kind: "c_suite",
        label: role.title,
        detail:
          role.scope === "EXTERNAL_ORGANIZATION" && role.organizationName
            ? role.organizationName
            : "C-Suite",
      });
      continue;
    }
    if (role.category === "BOARD" && role.scope === "THIS_ASSOCIATION") {
      badges.push({
        kind: "our_board",
        label: role.title,
        detail: "Our board",
      });
      continue;
    }
    if (role.category === "BOARD" && role.scope === "EXTERNAL_ORGANIZATION") {
      badges.push({
        kind: "external_board",
        label: role.title,
        detail: role.organizationName ?? "External board",
      });
      continue;
    }
    if (role.category === "COMMITTEE") {
      badges.push({
        kind: "committee",
        label: role.title,
        detail: "Committee",
      });
      continue;
    }
    if (role.category === "STAFF") {
      badges.push({
        kind: "staff",
        label: role.title,
        detail: "Staff",
      });
      continue;
    }
    if (role.category === "EXECUTIVE") {
      badges.push({
        kind: "executive",
        label: role.title,
        detail: role.leadershipLevel
          ? LEADERSHIP_LEVEL_LABELS[role.leadershipLevel]
          : "Executive",
      });
    }
  }

  const formerCount = roles.filter((r) => !r.isCurrent).length;
  if (formerCount > 0 && badges.length === 0) {
    badges.push({ kind: "former", label: `${formerCount} former role(s)` });
  }

  return badges.slice(0, 6);
}

export type RoleProfileGroup = {
  id: string;
  heading: string;
  roles: MemberRoleRow[];
};

/**
 * Group current roles for profile display sections.
 */
export function groupRolesForProfile(roles: MemberRoleRow[]): RoleProfileGroup[] {
  const current = roles.filter((r) => r.isCurrent);
  const groups: RoleProfileGroup[] = [];

  const cSuite = current.filter((r) => r.leadershipLevel === "C_SUITE");
  if (cSuite.length) {
    groups.push({ id: "c_suite", heading: "C-Suite", roles: cSuite });
  }

  const ourBoard = current.filter(
    (r) => r.category === "BOARD" && r.scope === "THIS_ASSOCIATION",
  );
  if (ourBoard.length) {
    groups.push({ id: "our_board", heading: "Our board", roles: ourBoard });
  }

  const extBoard = current.filter(
    (r) => r.category === "BOARD" && r.scope === "EXTERNAL_ORGANIZATION",
  );
  if (extBoard.length) {
    groups.push({
      id: "external_board",
      heading: "External boards & associations",
      roles: extBoard,
    });
  }

  const senior = current.filter(
    (r) =>
      r.leadershipLevel === "SENIOR_EXECUTIVE" &&
      !cSuite.some((c) => c.id === r.id),
  );
  if (senior.length) {
    groups.push({
      id: "senior",
      heading: "Senior leadership",
      roles: senior,
    });
  }

  const committee = current.filter((r) => r.category === "COMMITTEE");
  if (committee.length) {
    groups.push({ id: "committee", heading: "Committees", roles: committee });
  }

  const other = current.filter(
    (r) =>
      !cSuite.includes(r) &&
      !ourBoard.includes(r) &&
      !extBoard.includes(r) &&
      !senior.includes(r) &&
      !committee.includes(r),
  );
  if (other.length) {
    groups.push({ id: "other", heading: "Other roles", roles: other });
  }

  const former = roles.filter((r) => !r.isCurrent);
  if (former.length) {
    groups.push({ id: "former", heading: "Former roles", roles: former });
  }

  return groups;
}
