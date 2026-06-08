/**
 * Maps MemberTier names to association membership class for reporting.
 * Supports explicit "General" / "Associate" labels and common demo tier names.
 */

export type MembershipClass = "general" | "associate" | "other";

export const MEMBERSHIP_CLASS_LABEL: Record<MembershipClass, string> = {
  general: "General membership",
  associate: "Associate membership",
  other: "Other / unassigned",
};

/** Classify a tier display name — case-insensitive keyword match. */
export function membershipClassFromTierName(
  tierName: string | null | undefined,
): MembershipClass {
  if (!tierName?.trim()) return "other";
  const n = tierName.toLowerCase();
  if (n.includes("associate")) return "associate";
  if (
    n.includes("general") ||
    n.includes("individual") ||
    n.includes("full member") ||
    n.includes("regular")
  ) {
    return "general";
  }
  return "other";
}
