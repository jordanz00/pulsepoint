"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCommittee } from "@/app/actions/committees";
import { ASSOCIATION_DEPARTMENT_IDS } from "@/lib/association/departments";

const KINDS = [
  { value: "STANDING", label: "Standing" },
  { value: "ADVISORY", label: "Advisory" },
  { value: "TASK_FORCE", label: "Task force" },
  { value: "COUNCIL", label: "Council" },
] as const;

export function CommitteeCreateForm({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="ds-card ds-glass committee-create-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await createCommittee(orgSlug, {
            name: String(fd.get("name") ?? ""),
            kind: String(fd.get("kind") ?? "STANDING"),
            departmentId: String(fd.get("departmentId") ?? "member_services"),
            description: String(fd.get("description") ?? ""),
          });
          if (res.ok && res.data?.id) {
            router.push(`/${orgSlug}/committees/${res.data.id}`);
            return;
          }
          setMsg(res.ok ? "Committee created." : res.error);
          if (res.ok) e.currentTarget.reset();
        });
      }}
    >
      <h2 className="ds-page-title" style={{ fontSize: "var(--ds-text-headline)" }}>
        New committee
      </h2>
      <div className="committee-form-grid">
        <input
          name="name"
          required
          placeholder="Committee name"
          className="pc-input"
          maxLength={120}
        />
        <select name="kind" className="pc-input" defaultValue="STANDING">
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <select name="departmentId" className="pc-input" defaultValue="member_services">
          {ASSOCIATION_DEPARTMENT_IDS.map((id) => (
            <option key={id} value={id}>
              {id.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Purpose (optional)"
          className="pc-textarea"
          rows={2}
          maxLength={500}
        />
      </div>
      <button type="submit" className="ds-btn ds-btn--primary" disabled={pending}>
        Create committee
      </button>
      {msg ? <p className="ds-page-subtitle m-0">{msg}</p> : null}
    </form>
  );
}
