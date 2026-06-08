"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkflowRunFields } from "@/app/actions/crm-workflows";
import type { WorkflowField } from "@/lib/crm/workflow-types";

export function WorkflowCardFields({
  orgSlug,
  runId,
  fields,
  values,
  compact,
}: {
  orgSlug: string;
  runId: string;
  fields: WorkflowField[];
  values: Record<string, string>;
  compact?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function save(fieldId: string, value: string) {
    startTransition(async () => {
      await updateWorkflowRunFields(orgSlug, runId, { [fieldId]: value });
      router.refresh();
    });
  }

  if (fields.length === 0) return null;

  return (
    <div className={`mt-2 space-y-1.5 border-t border-zinc-100 pt-2 ${compact ? "text-xs" : "text-sm"}`}>
      {fields.map((f) => (
        <label key={f.id} className="block">
          <span className="text-zinc-500">{f.label}</span>
          {f.type === "select" && f.options ? (
            <select
              className="pc-input mt-0.5 w-full text-xs"
              value={values[f.id] ?? ""}
              onChange={(e) => save(f.id, e.target.value)}
            >
              <option value="">—</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type === "date" ? "date" : "text"}
              className="pc-input mt-0.5 w-full text-xs"
              value={values[f.id] ?? ""}
              onChange={(e) => save(f.id, e.target.value)}
              onBlur={(e) => save(f.id, e.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  );
}
