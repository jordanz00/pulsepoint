/**
 * Member deletion policy — retention and forensic clarity.
 */

import type { OrgDb } from "@/lib/db";

/**
 * Members with event registrations cannot be hard-deleted (compliance / forensics).
 * Registrations use onDelete SetNull — deleting would orphan payment history context.
 */
export async function countBlockingRegistrations(
  db: OrgDb,
  memberId: string,
): Promise<number> {
  return db.eventRegistration.count({
    where: { memberId },
  });
}
