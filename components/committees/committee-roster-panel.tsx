"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  addCommitteeMember,
  removeCommitteeMember,
  updateCommitteeMember,
} from "@/app/actions/committees";
import {
  COMMITTEE_OFFICER_ROLES,
  officerRoleLabel,
} from "@/lib/committees/officer-roles";

type MemberOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type CommitteeRow = {
  id: string;
  name: string;
  kind: string;
  departmentId: string;
  description: string;
  isActive: boolean;
  memberships: Array<{
    id: string;
    title: string;
    officerRole: string;
    member: MemberOption;
  }>;
  meetings?: Array<{ id: string; startsAt: Date; status: string }>;
};

const KIND_LABELS: Record<string, string> = {
  STANDING: "Standing",
  ADVISORY: "Advisory",
  TASK_FORCE: "Task force",
  COUNCIL: "Council",
};

export function CommitteeRosterPanel({
  orgSlug,
  committees,
  memberOptions,
  canWrite,
  detailMode = false,
}: {
  orgSlug: string;
  committees: CommitteeRow[];
  memberOptions: MemberOption[];
  canWrite: boolean;
  detailMode?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (committees.length === 0) {
    return (
      <p className="pp-empty-copy">
        No committees yet. {canWrite ? "Create one above to start building rosters." : ""}
      </p>
    );
  }

  return (
    <div className="committee-roster">
      {msg ? <p className="ds-page-subtitle m-0">{msg}</p> : null}
      {committees.map((committee) => (
        <article
          key={committee.id}
          className={`committee-card ds-card ds-glass${detailMode ? " committee-card--flat" : ""}`}
        >
          {!detailMode ? (
            <header className="committee-card__head">
              <div>
                <h2 className="committee-card__title">
                  <Link href={`/${orgSlug}/committees/${committee.id}`}>
                    {committee.name}
                  </Link>
                </h2>
                <p className="committee-card__meta">
                  {KIND_LABELS[committee.kind] ?? committee.kind} ·{" "}
                  {committee.departmentId.replace(/_/g, " ")}
                  {!committee.isActive ? " · Inactive" : ""}
                </p>
                {committee.description ? (
                  <p className="committee-card__meta">{committee.description}</p>
                ) : null}
              </div>
              <span className="committee-card__badge">
                {committee.memberships.length} members
              </span>
            </header>
          ) : (
            <h2 className="committee-section__title">Full roster</h2>
          )}

          {committee.memberships.length === 0 ? (
            <p className="ds-page-subtitle m-0">No current members on this roster.</p>
          ) : (
            <table className="committee-roster-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Title</th>
                  {canWrite ? <th aria-label="Actions" /> : null}
                </tr>
              </thead>
              <tbody>
                {committee.memberships.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link
                        href={`/${orgSlug}/members/${row.member.id}`}
                        className="ds-page-eyebrow"
                        style={{ textTransform: "none", letterSpacing: 0 }}
                      >
                        {row.member.firstName} {row.member.lastName}
                      </Link>
                    </td>
                    <td>{officerRoleLabel(row.officerRole)}</td>
                    <td>{row.title}</td>
                    {canWrite ? (
                      <td className="committee-roster-table__actions">
                        <select
                          className="pc-input committee-roster-table__select"
                          defaultValue={row.officerRole}
                          disabled={pending}
                          aria-label={`Role for ${row.member.lastName}`}
                          onChange={(e) => {
                            startTransition(async () => {
                              const res = await updateCommitteeMember(
                                orgSlug,
                                committee.id,
                                {
                                  membershipId: row.id,
                                  officerRole: e.target.value,
                                },
                              );
                              setMsg(res.ok ? "Role updated." : res.error);
                            });
                          }}
                        >
                          {COMMITTEE_OFFICER_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ds-btn ds-btn--ghost"
                          disabled={pending}
                          onClick={() => {
                            startTransition(async () => {
                              const res = await removeCommitteeMember(orgSlug, row.id);
                              setMsg(res.ok ? "Member removed from roster." : res.error);
                            });
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {canWrite ? (
            <form
              className="committee-add-form"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startTransition(async () => {
                  const res = await addCommitteeMember(orgSlug, committee.id, {
                    memberId: String(fd.get("memberId") ?? ""),
                    officerRole: String(fd.get("officerRole") ?? "MEMBER"),
                    title: String(fd.get("title") ?? ""),
                  });
                  setMsg(res.ok ? "Member added to roster." : res.error);
                  if (res.ok) e.currentTarget.reset();
                });
              }}
            >
              <select name="memberId" required className="pc-input" defaultValue="">
                <option value="" disabled>
                  Select member…
                </option>
                {memberOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.lastName}, {m.firstName}
                    {m.email ? ` (${m.email})` : ""}
                  </option>
                ))}
              </select>
              <select name="officerRole" className="pc-input" defaultValue="MEMBER">
                {COMMITTEE_OFFICER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <input
                name="title"
                placeholder="Custom title (optional)"
                className="pc-input"
                maxLength={80}
              />
              <button type="submit" className="ds-btn ds-btn--secondary" disabled={pending}>
                Add to roster
              </button>
            </form>
          ) : null}

          {!detailMode ? (
            <p className="committee-card__footer">
              <Link href={`/${orgSlug}/committees/${committee.id}`} className="ds-btn ds-btn--ghost">
                Manage committee →
              </Link>
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
