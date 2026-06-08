import Link from "next/link";
import { resolveStages } from "@/lib/crm/workflow-utils";
import { AddMemberToWorkflow } from "@/components/crm/add-member-to-workflow";

type Run = {
  id: string;
  stageId: string;
  currentStep: number;
  workflow: {
    id: string;
    name: string;
    department: string;
    stages: unknown;
    steps: unknown;
  };
};

export function MemberWorkflowPanel({
  orgSlug,
  memberId,
  runs,
  workflows,
}: {
  orgSlug: string;
  memberId: string;
  runs: Run[];
  workflows: Array<{ id: string; name: string; department: string }>;
}) {
  return (
    <div className="space-y-4">
      <AddMemberToWorkflow orgSlug={orgSlug} memberId={memberId} workflows={workflows} />

      {runs.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {runs.map((r) => {
            const stages = resolveStages(r.workflow.stages, r.workflow.steps);
            const stage =
              stages.find((s) => s.id === r.stageId) ?? stages[r.currentStep];
            return (
              <li key={r.id} className="rounded-lg border border-zinc-100 px-3 py-2">
                <Link
                  href={`/${orgSlug}/crm/workflows/${r.workflow.id}`}
                  className="font-medium text-[var(--pc-brand)]"
                >
                  {r.workflow.name}
                </Link>
                <span className="text-zinc-500">
                  {" "}
                  · {r.workflow.department || "General"} · {stage?.label ?? "In progress"}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">Not on any active workflow.</p>
      )}
    </div>
  );
}
