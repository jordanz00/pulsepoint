"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { advanceCrmWorkflowRun, startCrmWorkflowRun } from "@/app/actions/crm-workflows";

type Workflow = {
  id: string;
  name: string;
  kind: string;
  description: string;
  steps: unknown;
  _count: { runs: number };
};

type Run = {
  id: string;
  currentStep: number;
  dueAt: Date | null;
  member: { id: string; firstName: string; lastName: string };
  workflow: { name: string; steps: unknown };
};

export function WorkflowStartButtons({
  orgSlug,
  workflows,
  memberId,
}: {
  orgSlug: string;
  workflows: Workflow[];
  memberId?: string;
}) {
  const router = useRouter();

  if (!memberId) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {workflows.map((w) => (
        <Button
          key={w.id}
          type="button"
          variant="secondary"
          onClick={async () => {
            await startCrmWorkflowRun(w.id, memberId, orgSlug);
            router.refresh();
          }}
        >
          Start: {w.name}
        </Button>
      ))}
    </div>
  );
}

export function ActiveWorkflowRuns({ orgSlug, runs }: { orgSlug: string; runs: Run[] }) {
  const router = useRouter();

  if (runs.length === 0) {
    return <p className="text-sm text-zinc-500">No active people workflows.</p>;
  }

  return (
    <ul className="space-y-3">
      {runs.map((r) => {
        const steps = r.workflow.steps as Array<{ label: string }>;
        const stepLabel = steps[r.currentStep]?.label ?? `Step ${r.currentStep + 1}`;
        return (
          <li key={r.id} className="rounded-lg border border-zinc-100 bg-white px-4 py-3 text-sm">
            <Link href={`/${orgSlug}/members/${r.member.id}`} className="font-medium text-[var(--pc-brand)]">
              {r.member.firstName} {r.member.lastName}
            </Link>
            <span className="text-zinc-500"> · {r.workflow.name}</span>
            <p className="mt-1 text-zinc-600">Current: {stepLabel}</p>
            <Button
              type="button"
              className="mt-2"
              onClick={async () => {
                await advanceCrmWorkflowRun(r.id, orgSlug);
                router.refresh();
              }}
            >
              Complete step →
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
