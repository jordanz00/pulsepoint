"use client";

import { useMemo, useState, useTransition } from "react";
import { bulkAssignMembersToHospital } from "@/app/actions/member-bulk-assign";
import type { GeneralMemberFacilityRow } from "@/lib/general-members-by-facility";

type FacilityOption = { id: string; name: string };

export function FacilityBulkAssignPanel({
  orgSlug,
  unassigned,
  facilities,
}: {
  orgSlug: string;
  unassigned: GeneralMemberFacilityRow[];
  facilities: FacilityOption[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [facilityId, setFacilityId] = useState(facilities[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => unassigned.map((m) => m.memberId), [unassigned]);
  const allSelected = unassigned.length > 0 && selected.size === unassigned.length;

  if (unassigned.length === 0 || facilities.length === 0) return null;

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

  function runAssign() {
    const ids = [...selected];
    if (ids.length === 0 || !facilityId) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await bulkAssignMembersToHospital(orgSlug, {
        memberIds: ids,
        organizationAccountId: facilityId,
      });
      if (!res.ok) {
        setError(res.error ?? "Assign failed");
        return;
      }
      setMessage(`Assigned ${res.data?.updated ?? 0} member(s) to facility account.`);
      setSelected(new Set());
    });
  }

  return (
    <div className="mc-facility-bulk-assign" role="region" aria-label="Bulk assign to facility">
      <p className="mc-facility-bulk-assign-lead">
        Select unassigned general members and link them to a facility account—no spreadsheet sidecar.
      </p>
      <div className="mc-facility-bulk-assign-toolbar">
        <label className="text-sm">
          Facility account
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-2 py-2"
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="pc-btn-primary text-sm"
          disabled={pending || selected.size === 0 || !facilityId}
          onClick={runAssign}
        >
          {pending ? "Assigning…" : `Assign ${selected.size || ""} selected`}
        </button>
      </div>
      <ul className="mc-facility-bulk-assign-list">
        <li className="mc-facility-bulk-assign-all">
          <label>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            Select all unassigned ({unassigned.length})
          </label>
        </li>
        {unassigned.map((m) => (
          <li key={m.memberId}>
            <label>
              <input
                type="checkbox"
                checked={selected.has(m.memberId)}
                onChange={() => toggle(m.memberId)}
              />
              {m.firstName} {m.lastName}
              {m.email ? ` · ${m.email}` : ""}
            </label>
          </li>
        ))}
      </ul>
      {message ? (
        <p className="mc-facility-bulk-assign-msg mc-facility-bulk-assign-msg--ok" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mc-facility-bulk-assign-msg mc-facility-bulk-assign-msg--err" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
