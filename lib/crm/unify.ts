/**
 * Contact unification — duplicate detection across siloed records.
 */

import { getOrgDb } from "@/lib/db";

export type DuplicateGroup = {
  key: string;
  reason: string;
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    sourceCount: number;
  }>;
};

export async function findDuplicateGroups(orgId: string): Promise<DuplicateGroup[]> {
  const db = getOrgDb(orgId);
  const members = await db.member.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      contactSources: { select: { id: true } },
    },
    take: 500,
  });

  const byEmail = new Map<string, typeof members>();
  const byPhone = new Map<string, typeof members>();
  const byName = new Map<string, typeof members>();

  for (const m of members) {
    if (m.email) {
      const k = m.email.toLowerCase().trim();
      const list = byEmail.get(k) ?? [];
      list.push(m);
      byEmail.set(k, list);
    }
    if (m.phone) {
      const k = m.phone.replace(/\D/g, "");
      if (k.length >= 10) {
        const list = byPhone.get(k) ?? [];
        list.push(m);
        byPhone.set(k, list);
      }
    }
    const nameKey = `${m.lastName.toLowerCase()}|${m.firstName.toLowerCase()}`;
    const list = byName.get(nameKey) ?? [];
    list.push(m);
    byName.set(nameKey, list);
  }

  const groups: DuplicateGroup[] = [];
  const seen = new Set<string>();

  function addGroup(reason: string, key: string, list: typeof members) {
    if (list.length < 2) return;
    const sig = list
      .map((m) => m.id)
      .sort()
      .join(",");
    if (seen.has(sig)) return;
    seen.add(sig);
    groups.push({
      key,
      reason,
      members: list.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone,
        sourceCount: m.contactSources.length,
      })),
    });
  }

  for (const [email, list] of byEmail) {
    addGroup("Same email address", email, list);
  }
  for (const [phone, list] of byPhone) {
    addGroup("Same phone number", phone, list);
  }
  for (const [name, list] of byName) {
    addGroup("Same full name", name, list);
  }

  return groups.slice(0, 20);
}

export async function listContactSourceSummary(orgId: string) {
  const db = getOrgDb(orgId);
  const rows = await db.contactSource.groupBy({
    by: ["sourceKind"],
    _count: { id: true },
  });
  return rows.map((r) => ({
    kind: r.sourceKind,
    count: r._count.id,
  }));
}
