"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FacilityBulkAssignPanel } from "@/components/members/facility-bulk-assign-panel";
import type { GeneralMembersByFacilitySnapshot } from "@/lib/general-members-by-facility";

export function GeneralMembersFacilityRoster({
  orgSlug,
  snapshot,
  compact = false,
}: {
  orgSlug: string;
  snapshot: GeneralMembersByFacilitySnapshot;
  compact?: boolean;
}) {
  const [expandedType, setExpandedType] = useState<string | null>(
    snapshot.typeGroups[0]?.facilityType ?? null,
  );

  const allTypes = useMemo(
    () => snapshot.typeGroups.map((g) => g.facilityType),
    [snapshot.typeGroups],
  );

  const facilityOptions = useMemo(
    () =>
      snapshot.typeGroups.flatMap((g) =>
        g.facilities.map((f) => ({ id: f.id, name: f.name })),
      ),
    [snapshot.typeGroups],
  );

  if (snapshot.totalGeneralActive === 0) {
    return (
      <p className="mc-facility-roster-empty">
        No active general membership accounts in the directory yet.
      </p>
    );
  }

  return (
    <div className={`mc-facility-roster${compact ? " mc-facility-roster--compact" : ""}`}>
      <div className="mc-facility-roster-kpis" role="list">
        <div className="mc-facility-roster-kpi" role="listitem">
          <span className="mc-facility-roster-kpi-value">{snapshot.totalGeneralActive}</span>
          <span className="mc-facility-roster-kpi-label">Active general</span>
        </div>
        <div className="mc-facility-roster-kpi" role="listitem">
          <span className="mc-facility-roster-kpi-value">{snapshot.onRoster}</span>
          <span className="mc-facility-roster-kpi-label">On facility roster</span>
        </div>
        <div className="mc-facility-roster-kpi" role="listitem">
          <span className="mc-facility-roster-kpi-value">{snapshot.typeGroups.length}</span>
          <span className="mc-facility-roster-kpi-label">Facility types</span>
        </div>
        {snapshot.unassigned.length > 0 ? (
          <div className="mc-facility-roster-kpi mc-facility-roster-kpi--warn" role="listitem">
            <span className="mc-facility-roster-kpi-value">{snapshot.unassigned.length}</span>
            <span className="mc-facility-roster-kpi-label">Unassigned</span>
          </div>
        ) : null}
      </div>

      <nav className="mc-facility-roster-type-nav" aria-label="Facility type">
        {snapshot.typeGroups.map((g) => (
          <button
            key={g.facilityType}
            type="button"
            className={`mc-facility-roster-type-chip${
              expandedType === g.facilityType ? " mc-facility-roster-type-chip--active" : ""
            }`}
            aria-pressed={expandedType === g.facilityType}
            onClick={() =>
              setExpandedType((t) => (t === g.facilityType ? null : g.facilityType))
            }
          >
            {g.typeLabel}
            <span className="mc-facility-roster-type-count">{g.memberCount}</span>
          </button>
        ))}
      </nav>

      <div className="mc-facility-roster-groups">
        {snapshot.typeGroups.map((group) => {
          const open = expandedType === group.facilityType || !compact;
          if (!open) return null;
          return (
            <section
              key={group.facilityType}
              className="mc-facility-roster-group"
              aria-labelledby={`facility-type-${group.facilityType}`}
            >
              <header className="mc-facility-roster-group-head">
                <h3 id={`facility-type-${group.facilityType}`}>{group.typeLabel}</h3>
                <p>
                  {group.facilityCount} account{group.facilityCount === 1 ? "" : "s"} ·{" "}
                  {group.memberCount} general member{group.memberCount === 1 ? "" : "s"}
                </p>
              </header>
              <div className="mc-facility-roster-accounts">
                {group.facilities.map((facility) => (
                  <article key={facility.id} className="mc-facility-roster-account">
                    <div className="mc-facility-roster-account-head">
                      <div>
                        <h4>{facility.name}</h4>
                        {facility.region ? (
                          <span className="mc-facility-roster-region">{facility.region}</span>
                        ) : null}
                      </div>
                      <span className="mc-facility-roster-account-meta">
                        {facility.members.length} member
                        {facility.members.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ul className="mc-facility-roster-members">
                      {facility.members.map((m) => (
                        <li key={m.memberId}>
                          <Link
                            href={`/${orgSlug}/members/${m.memberId}`}
                            className="mc-facility-roster-member-link"
                          >
                            <span className="mc-facility-roster-member-name">
                              {m.firstName} {m.lastName}
                            </span>
                            {m.jobTitle ? (
                              <span className="mc-facility-roster-member-title">
                                {m.jobTitle}
                              </span>
                            ) : null}
                          </Link>
                          {m.email ? (
                            <span className="mc-facility-roster-member-email">{m.email}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {snapshot.unassigned.length > 0 ? (
        <section className="mc-facility-roster-group mc-facility-roster-group--unassigned">
          <header className="mc-facility-roster-group-head">
            <h3>General members — no facility assigned</h3>
            <p>Assign members to a facility account below, or edit individually in the directory.</p>
          </header>
          <FacilityBulkAssignPanel
            orgSlug={orgSlug}
            unassigned={snapshot.unassigned}
            facilities={facilityOptions}
          />
          <ul className="mc-facility-roster-members mc-facility-roster-members--plain">
            {snapshot.unassigned.map((m) => (
              <li key={m.memberId}>
                <Link
                  href={`/${orgSlug}/members/${m.memberId}`}
                  className="mc-facility-roster-member-link"
                >
                  {m.firstName} {m.lastName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {allTypes.length === 0 && snapshot.onRoster === 0 ? (
        <p className="mc-facility-roster-hint">
          Assign general members to a healthcare facility account to group them by hospital,
          network, cancer center, behavioral health, and other facility types.
        </p>
      ) : null}
    </div>
  );
}
