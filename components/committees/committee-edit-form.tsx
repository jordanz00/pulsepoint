"use client";

import { useState, useTransition } from "react";
import { archiveCommittee, updateCommittee } from "@/app/actions/committees";
import { ASSOCIATION_DEPARTMENT_IDS } from "@/lib/association/departments";

const KINDS = [
  { value: "STANDING", label: "Standing" },
  { value: "ADVISORY", label: "Advisory" },
  { value: "TASK_FORCE", label: "Task force" },
  { value: "COUNCIL", label: "Council" },
] as const;

export function CommitteeEditForm({
  orgSlug,
  committee,
}: {
  orgSlug: string;
  committee: {
    id: string;
    name: string;
    kind: string;
    departmentId: string;
    description: string;
    isActive: boolean;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="ds-card ds-glass committee-create-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await updateCommittee(orgSlug, {
            id: committee.id,
            name: String(fd.get("name") ?? ""),
            kind: String(fd.get("kind") ?? "STANDING"),
            departmentId: String(fd.get("departmentId") ?? "member_services"),
            description: String(fd.get("description") ?? ""),
            isActive: fd.get("isActive") === "on",
          });
          setMsg(res.ok ? "Committee saved." : res.error);
        });
      }}
    >
      <h2 className="committee-section__title">Committee profile</h2>
      <div className="committee-form-grid">
        <input
          name="name"
          required
          defaultValue={committee.name}
          className="pc-input"
          maxLength={120}
        />
        <select name="kind" className="pc-input" defaultValue={committee.kind}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <select
          name="departmentId"
          className="pc-input"
          defaultValue={committee.departmentId}
        >
          {ASSOCIATION_DEPARTMENT_IDS.map((id) => (
            <option key={id} value={id}>
              {id.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          defaultValue={committee.description}
          className="pc-textarea"
          rows={3}
          maxLength={500}
        />
        <label className="committee-check">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={committee.isActive}
          />
          Active committee
        </label>
      </div>
      <div className="committee-form-actions">
        <button type="submit" className="ds-btn ds-btn--primary" disabled={pending}>
          Save changes
        </button>
        {committee.isActive ? (
          <button
            type="button"
            className="ds-btn ds-btn--ghost"
            disabled={pending}
            onClick={() => {
              if (!confirm("Archive this committee? Rosters stay on file.")) return;
              startTransition(async () => {
                const res = await archiveCommittee(orgSlug, committee.id);
                setMsg(res.ok ? "Committee archived." : res.error);
              });
            }}
          >
            Archive
          </button>
        ) : null}
      </div>
      {msg ? <p className="ds-page-subtitle m-0">{msg}</p> : null}
    </form>
  );
}
