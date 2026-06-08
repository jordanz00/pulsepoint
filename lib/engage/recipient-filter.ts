/**
 * Engage audience recipient resolution — status + tag filters on Member.tags JSON.
 */

import type { MemberStatus } from "@/app/generated/prisma/client";

export type EngageAudienceFilter = {
  status?: MemberStatus;
  tag?: string;
  /** Alpha — filter by Member.workforcePersona */
  workforcePersona?: string;
};

/** True when member tags JSON/string contains the filter tag (case-insensitive). */
export function memberHasTag(tags: unknown, tag: string): boolean {
  if (!tag.trim()) return true;
  const tagStr =
    typeof tags === "string"
      ? tags
      : Array.isArray(tags)
        ? JSON.stringify(tags)
        : tags && typeof tags === "object"
          ? JSON.stringify(tags)
          : "";
  return tagStr.toLowerCase().includes(tag.trim().toLowerCase());
}

export function filterMembersByAudience<T extends { tags: unknown; status: MemberStatus; workforcePersona?: string }>(
  members: T[],
  filter: EngageAudienceFilter,
): T[] {
  return members.filter((m) => {
    if (filter.status && m.status !== filter.status) return false;
    if (filter.tag && !memberHasTag(m.tags, filter.tag)) return false;
    if (filter.workforcePersona && m.workforcePersona !== filter.workforcePersona) return false;
    return true;
  });
}
