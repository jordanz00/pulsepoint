"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { moveWorkflowRunToStage, cancelWorkflowRun } from "@/app/actions/crm-workflows";
import type { WorkflowField, WorkflowStage } from "@/lib/crm/workflow-types";
import { WorkflowCardFields } from "@/components/crm/workflow-card-fields";

type Row = {
  id: string;
  memberId: string;
  stageId: string;
  dueAt: Date | string | null;
  fieldValues: Record<string, string>;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    company: string | null;
  };
};

export function WorkflowListView({
  orgSlug,
  workflowId,
  stages,
  fields,
  rows,
}: {
  orgSlug: string;
  workflowId: string;
  stages: WorkflowStage[];
  fields: WorkflowField[];
  rows: Row[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--pc-border)] text-left text-zinc-500">
            <th className="py-2 pr-4">Contact</th>
            <th className="py-2 pr-4">Stage</th>
            {fields.map((f) => (
              <th key={f.id} className="py-2 pr-4">
                {f.label}
              </th>
            ))}
            <th className="py-2 pr-4">Due</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={fields.length + 4} className="py-6 text-zinc-400">
                No contacts on this workflow yet — add from a member profile.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-[var(--pc-border)]/60 align-top">
                <td className="py-3 pr-4">
                  <Link
                    href={`/${orgSlug}/members/${row.member.id}`}
                    className="font-medium text-[var(--pc-brand)]"
                  >
                    {row.member.firstName} {row.member.lastName}
                  </Link>
                  {row.member.company ? (
                    <p className="text-xs text-zinc-500">{row.member.company}</p>
                  ) : null}
                </td>
                <td className="py-3 pr-4">
                  <select
                    className="pc-input text-xs"
                    disabled={pending}
                    value={row.stageId}
                    onChange={(e) =>
                      startTransition(async () => {
                        await moveWorkflowRunToStage(orgSlug, row.id, e.target.value);
                        router.refresh();
                      })
                    }
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                {fields.map((f) => (
                  <td key={f.id} className="py-3 pr-4 min-w-[8rem]">
                    <WorkflowCardFields
                      orgSlug={orgSlug}
                      runId={row.id}
                      fields={[f]}
                      values={row.fieldValues}
                      compact
                    />
                  </td>
                ))}
                <td className="py-3 pr-4 text-xs text-zinc-600">
                  {row.dueAt ? new Date(row.dueAt).toLocaleDateString() : "—"}
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await cancelWorkflowRun(orgSlug, row.id);
                        router.refresh();
                      })
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
