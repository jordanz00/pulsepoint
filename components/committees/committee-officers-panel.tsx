"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updateCommitteeMember } from "@/app/actions/committees";
import {
  COMMITTEE_OFFICER_ROLES,
  isOfficerRole,
  officerRoleLabel,
} from "@/lib/committees/officer-roles";

type MemberRow = {
  id: string;
  title: string;
  officerRole: string;
  member: { id: string; firstName: string; lastName: string };
};

export function CommitteeOfficersPanel({
  orgSlug,
  committeeId,
  memberships,
  canWrite,
}: {
  orgSlug: string;
  committeeId: string;
  memberships: MemberRow[];
  canWrite: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const officers = memberships.filter((m) => isOfficerRole(m.officerRole));

  return (
    <section className="ds-card ds-glass committee-section">
      <h2 className="committee-section__title">Officers</h2>
      <p className="committee-section__lead">
        Chair, vice chair, secretary, treasurer, and members at large. One active chair per
        committee.
      </p>
      {msg ? <p className="ds-page-subtitle">{msg}</p> : null}

      {officers.length === 0 ? (
        <p className="pp-empty-copy">No officers assigned yet.</p>
      ) : (
        <ul className="committee-officers-list">
          {officers.map((row) => (
            <li key={row.id} className="committee-officers-list__item">
              <div>
                <p className="committee-officers-list__role">
                  {officerRoleLabel(row.officerRole)}
                </p>
                <Link href={`/${orgSlug}/members/${row.member.id}`} className="committee-officers-list__name">
                  {row.member.firstName} {row.member.lastName}
                </Link>
              </div>
              {canWrite ? (
                <select
                  className="pc-input committee-officers-list__select"
                  defaultValue={row.officerRole}
                  disabled={pending}
                  onChange={(e) => {
                    const officerRole = e.target.value;
                    startTransition(async () => {
                      const res = await updateCommitteeMember(orgSlug, committeeId, {
                        membershipId: row.id,
                        officerRole,
                      });
                      setMsg(res.ok ? "Officer role updated." : res.error);
                    });
                  }}
                >
                  {COMMITTEE_OFFICER_ROLES.filter((r) => r.isOfficer).map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
