"use client";

import { useState, useTransition } from "react";
import type { OrgRole } from "@/app/generated/prisma/client";
import { updateStaffRole } from "@/app/actions/staff-admin";
import { assignableRoles } from "@/lib/staff/role-policy";

type StaffRow = {
  id: string;
  role: OrgRole;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

const ROLE_LABELS: Record<OrgRole, string> = {
  STAFF: "Staff",
  ADMIN: "Admin",
  OWNER: "Owner",
};

export function StaffRosterPanel({
  orgSlug,
  rows,
  actorRole,
  currentUserId,
}: {
  orgSlug: string;
  rows: StaffRow[];
  actorRole: OrgRole;
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const options = assignableRoles(actorRole);

  return (
    <div className="staff-roster">
      {msg ? <p className="ds-page-subtitle m-0">{msg}</p> : null}
      {rows.map((row) => {
        const isSelf = row.user.id === currentUserId;
        const canEdit = options.length > 0 && !isSelf && !(actorRole === "ADMIN" && row.role === "OWNER");

        return (
          <div key={row.id} className="staff-roster-row">
            <div>
              <p className="staff-roster-row__email">{row.user.email}</p>
              {row.user.name ? (
                <p className="staff-roster-row__name">{row.user.name}</p>
              ) : null}
            </div>
            <span
              className={`staff-roster-row__role${row.role === "OWNER" ? " staff-roster-row__role--owner" : ""}`}
            >
              {ROLE_LABELS[row.role]}
            </span>
            {canEdit ? (
              <select
                defaultValue={row.role}
                disabled={pending}
                aria-label={`Role for ${row.user.email}`}
                onChange={(e) => {
                  const next = e.target.value as OrgRole;
                  startTransition(async () => {
                    const res = await updateStaffRole(orgSlug, row.id, next);
                    setMsg(res.ok ? "Role updated." : res.error);
                    if (!res.ok) e.target.value = row.role;
                  });
                }}
              >
                {options.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            ) : (
              <span className="ds-page-subtitle m-0" style={{ fontSize: "var(--ds-text-caption)" }}>
                {isSelf ? "You" : "—"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
