"use client";

import { useState, useTransition } from "react";
import type { WebFormFieldDef } from "@/lib/crm/web-form-fields";

export function PublicWebForm({
  orgSlug,
  formSlug,
  fields,
}: {
  orgSlug: string;
  formSlug: string;
  fields: WebFormFieldDef[];
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <p className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Thank you — your submission was received. Check your inbox for a confirmation email.
      </p>
    );
  }

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const body: Record<string, string> = {};
        for (const f of fields) {
          body[f.id] = String(fd.get(f.id) ?? "");
        }
        startTransition(async () => {
          setError(null);
          const res = await fetch(`/api/public/forms/${orgSlug}/${formSlug}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const json = (await res.json()) as { ok?: boolean; message?: string };
          if (!res.ok || !json.ok) {
            setError(json.message ?? "Submission failed");
            return;
          }
          setDone(true);
        });
      }}
    >
      {fields.map((f) => (
        <label key={f.id} className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-800">
            {f.label}
            {f.required ? " *" : ""}
          </span>
          {f.type === "textarea" ? (
            <textarea name={f.id} className="pc-input w-full" rows={3} required={f.required} />
          ) : f.type === "select" ? (
            <select name={f.id} className="pc-input w-full" required={f.required}>
              <option value="">Select…</option>
              {(f.options ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={f.id}
              type={f.type === "email" ? "email" : "text"}
              className="pc-input w-full"
              required={f.required}
            />
          )}
        </label>
      ))}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" className="pc-btn-primary w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
