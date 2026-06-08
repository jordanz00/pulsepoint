"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateContactRecordField } from "@/app/actions/contact-record";
import type { InlineEditableField } from "@/lib/contact-record/types";

export function InlineField({
  orgSlug,
  memberId,
  field,
  label,
  value,
  type = "text",
  options,
}: {
  orgSlug: string;
  memberId: string;
  field: InlineEditableField;
  label: string;
  value: string;
  type?: "text" | "email" | "url" | "select";
  options?: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function save() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await updateContactRecordField(orgSlug, memberId, field, draft);
      if (!res.ok) {
        setErr(res.error ?? "Save failed");
        return;
      }
      setErr(null);
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="group rounded-lg border border-transparent px-2 py-1.5 hover:border-[var(--pc-border)] hover:bg-white/60">
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      {editing ? (
        <dd className="mt-1">
          {type === "select" && options ? (
            <select
              className="pc-input w-full text-sm"
              value={draft}
              disabled={pending}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              autoFocus
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type === "email" ? "email" : "text"}
              className="pc-input w-full text-sm"
              value={draft}
              disabled={pending}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") {
                  setDraft(value);
                  setEditing(false);
                }
              }}
              autoFocus
            />
          )}
          {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
        </dd>
      ) : (
        <dd
          className="mt-0.5 cursor-pointer text-sm text-zinc-900"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          title="Click to edit"
        >
          {value || <span className="text-zinc-400">—</span>}
          <span className="ml-2 text-xs text-zinc-400 opacity-0 group-hover:opacity-100">
            Edit
          </span>
        </dd>
      )}
    </div>
  );
}
