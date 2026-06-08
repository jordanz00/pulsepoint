"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startCrmWorkflowRun } from "@/app/actions/crm-workflows";

type WorkflowOption = { id: string; name: string; department: string };

export function AddMemberToWorkflow({
  orgSlug,
  memberId,
  workflows,
}: {
  orgSlug: string;
  memberId: string;
  workflows: WorkflowOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  if (workflows.length === 0) {
    return <p className="text-sm text-zinc-500">No workflows configured.</p>;
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-sm">
        <span className="mb-1 block text-zinc-500">Add to workflow</span>
        <select
          className="pc-input min-w-[14rem]"
          value={workflowId}
          onChange={(e) => setWorkflowId(e.target.value)}
        >
          {workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.department || "General"})
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="pc-btn-primary text-sm"
        disabled={pending || !workflowId}
        onClick={() =>
          startTransition(async () => {
            const res = await startCrmWorkflowRun(workflowId, memberId, orgSlug);
            setMsg(res.ok ? "Added to workflow." : res.error ?? "Failed");
            if (res.ok) router.refresh();
          })
        }
      >
        Add card
      </button>
      {msg ? <p className="w-full text-sm text-zinc-600">{msg}</p> : null}
    </div>
  );
}
