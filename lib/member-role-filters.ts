/**
 * Member directory role filters — Prisma where builders for include/exclude presets.
 *
 * WHO: Staff filtering MemberCore by CEO, board seat, C-suite, etc.
 * WHAT: Maps URL search params to typed Prisma `MemberWhereInput` role clauses.
 * HOW IT CONNECTS: Used by `members/page.tsx` list query; validated via `memberSearchSchema`.
 */

import type { Prisma } from "@/app/generated/prisma/client";
import type { memberSearchSchema } from "@/lib/validations/member";
import type { z } from "zod";

export type MemberSearchParams = z.infer<typeof memberSearchSchema>;

export const ROLE_FILTER_PRESET_LABELS = {
  ceo: "CEO",
  cfo: "CFO",
  coo: "COO",
  c_suite: "C-Suite (any)",
  our_board: "Our board",
  external_board: "External board",
  senior_leadership: "Senior leadership",
  committee: "Committee role",
  staff: "Staff role",
} as const;

export type RoleFilterPreset = keyof typeof ROLE_FILTER_PRESET_LABELS | "";

export const ROLE_FILTER_MODE_LABELS = {
  include: "Only show",
  exclude: "Exclude",
} as const;

/** Case variants for SQLite title matching (Prisma `contains` is case-sensitive). */
function titleVariants(...phrases: string[]): Prisma.MemberRoleWhereInput[] {
  const seen = new Set<string>();
  const clauses: Prisma.MemberRoleWhereInput[] = [];
  for (const phrase of phrases) {
    for (const variant of [phrase, phrase.toLowerCase(), phrase.toUpperCase()]) {
      if (seen.has(variant)) continue;
      seen.add(variant);
      clauses.push({ title: { contains: variant } });
    }
  }
  return clauses;
}

function presetToRoleWhere(preset: RoleFilterPreset): Prisma.MemberRoleWhereInput {
  const current = { isCurrent: true } as const;

  switch (preset) {
    case "ceo":
      return {
        ...current,
        OR: [
          ...titleVariants("CEO", "Chief Executive Officer", "Chief Executive"),
          { title: { contains: "President & CEO" } },
          { title: { contains: "President and CEO" } },
        ],
      };
    case "cfo":
      return {
        ...current,
        OR: titleVariants("CFO", "Chief Financial Officer"),
      };
    case "coo":
      return {
        ...current,
        OR: titleVariants("COO", "Chief Operating Officer"),
      };
    case "c_suite":
      return { ...current, leadershipLevel: "C_SUITE" };
    case "our_board":
      return {
        ...current,
        category: "BOARD",
        scope: "THIS_ASSOCIATION",
      };
    case "external_board":
      return {
        ...current,
        category: "BOARD",
        scope: "EXTERNAL_ORGANIZATION",
      };
    case "senior_leadership":
      return {
        ...current,
        leadershipLevel: { in: ["C_SUITE", "SENIOR_EXECUTIVE"] },
      };
    case "committee":
      return { ...current, category: "COMMITTEE" };
    case "staff":
      return { ...current, category: "STAFF" };
    default:
      return current;
  }
}

/**
 * Build tenant-scoped member list filter from validated search params.
 */
export function buildMemberListWhere(
  params: MemberSearchParams,
): Prisma.MemberWhereInput {
  const where: Prisma.MemberWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  const q = params.q?.trim();
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const preset = params.rolePreset;
  if (preset && preset in ROLE_FILTER_PRESET_LABELS) {
    const roleWhere = presetToRoleWhere(preset);
    where.roles =
      params.roleMode === "exclude"
        ? { none: roleWhere }
        : { some: roleWhere };
  }

  if (params.engagementTier) {
    where.engagementTier = params.engagementTier;
  }

  return where;
}

export function roleFilterSummary(params: MemberSearchParams): string | null {
  if (!params.rolePreset || !(params.rolePreset in ROLE_FILTER_PRESET_LABELS)) {
    return null;
  }
  const label = ROLE_FILTER_PRESET_LABELS[params.rolePreset];
  const mode = params.roleMode === "exclude" ? "Excluding" : "Showing only";
  return `${mode}: ${label}`;
}
