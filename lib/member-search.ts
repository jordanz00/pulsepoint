/**
 * Member directory search — Postgres uses case-insensitive contains;
 * SQLite uses indexed prefix-friendly contains (upgrade to GIN via manual migration on Neon).
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { isPostgresDatabase } from "@/lib/database-provider";

export function buildMemberSearchFilter(
  search?: string,
): Prisma.MemberWhereInput | undefined {
  const q = search?.trim();
  if (!q) return undefined;

  if (isPostgresDatabase()) {
    const insensitive = { contains: q, mode: "insensitive" as const };
    return {
      OR: [
        { firstName: insensitive },
        { lastName: insensitive },
        { email: insensitive },
      ],
    } as Prisma.MemberWhereInput;
  }

  return {
    OR: [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
    ],
  };
}
