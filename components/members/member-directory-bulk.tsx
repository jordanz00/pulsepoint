"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MemberRoleBadges } from "@/components/members/member-role-badges";
import { MemberPulseScoreCell } from "@/components/members/member-pulse-score-cell";
import type { EngagementTier } from "@/lib/engagement-score";
import { MemberBulkEditPanel } from "@/components/members/member-bulk-edit-panel";
import { memberStatusLabel } from "@/lib/admin-page-copy";
import type { MemberRoleRow } from "@/lib/member-roles";

type MemberRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  company: string | null;
  jobTitle: string | null;
  tags: unknown;
  roles: MemberRoleRow[];
  engagementScore: number;
  engagementTier: string;
};

export function MemberDirectoryBulk({
  orgSlug,
  members,
}: {
  orgSlug: string;
  members: MemberRow[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = useMemo(() => members.map((m) => m.id), [members]);
  const allSelected = members.length > 0 && selected.size === members.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  }

  return (
    <>
      <div className="pc-table-wrap mt-4 overflow-x-auto">
        <table className="pc-table">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all members in view"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th>Name</th>
              <th>MemberPulse</th>
              <th>Roles &amp; leadership</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className={selected.has(m.id) ? "mc-row-selected" : undefined}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${m.firstName} ${m.lastName}`}
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                  />
                </td>
                <td>
                  <Link href={`/${orgSlug}/members/${m.id}`} className="pc-link font-medium">
                    {m.lastName}, {m.firstName}
                  </Link>
                </td>
                <td>
                  <MemberPulseScoreCell
                    orgSlug={orgSlug}
                    memberId={m.id}
                    score={m.engagementScore}
                    tier={m.engagementTier as EngagementTier}
                  />
                </td>
                <td className="max-w-xs">
                  <MemberRoleBadges roles={m.roles} max={4} />
                </td>
                <td>{m.email ?? "—"}</td>
                <td className="text-sm text-zinc-600">{m.company ?? "—"}</td>
                <td>{memberStatusLabel(m.status as "ACTIVE" | "INACTIVE" | "LAPSED")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MemberBulkEditPanel
        orgSlug={orgSlug}
        selectedIds={[...selected]}
        onClearSelection={() => setSelected(new Set())}
      />
    </>
  );
}
