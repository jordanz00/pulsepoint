"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { moveWorkflowRunToStage } from "@/app/actions/crm-workflows";
import type { WorkflowField, WorkflowStage } from "@/lib/crm/workflow-types";
import { RELATIONSHIP_HEALTH_LABEL } from "@/lib/crm/constants";
import { WorkflowCardFields } from "@/components/crm/workflow-card-fields";
import { WorkflowConvertDealButton } from "@/components/crm/workflow-convert-deal-button";

type Card = {
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
    jobTitle: string | null;
    relationshipHealth: string | null;
  };
};

type Column = { stage: WorkflowStage; runs: Card[] };

export function WorkflowKanbanBoard({
  orgSlug,
  workflowId,
  fromTemplate,
  columns,
  fields,
}: {
  orgSlug: string;
  workflowId: string;
  fromTemplate?: string | null;
  columns: Column[];
  fields: WorkflowField[];
}) {
  const showConvert = fromTemplate === "lead_qualification";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dragRunId, setDragRunId] = useState<string | null>(null);

  function onDrop(stageId: string) {
    if (!dragRunId) return;
    startTransition(async () => {
      await moveWorkflowRunToStage(orgSlug, dragRunId, stageId);
      setDragRunId(null);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div
          key={col.stage.id}
          className="min-w-[16rem] flex-shrink-0 rounded-xl border border-[var(--pc-border)] bg-zinc-50/80 p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(col.stage.id)}
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">{col.stage.label}</h3>
            {col.stage.instructions ? (
              <p className="mt-1 text-xs text-zinc-500">{col.stage.instructions}</p>
            ) : null}
            <p className="mt-1 text-xs text-zinc-400">{col.runs.length} cards</p>
          </div>

          <ul className="space-y-2">
            {col.runs.map((card) => (
              <li
                key={card.id}
                draggable={!pending}
                onDragStart={() => setDragRunId(card.id)}
                className="cursor-grab rounded-lg border border-white bg-white p-3 shadow-sm active:cursor-grabbing"
              >
                <Link
                  href={`/${orgSlug}/members/${card.member.id}`}
                  className="font-medium text-[var(--pc-brand)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {card.member.firstName} {card.member.lastName}
                </Link>
                {card.member.company ? (
                  <p className="text-xs text-zinc-500">{card.member.company}</p>
                ) : null}
                {card.member.jobTitle ? (
                  <p className="text-xs text-zinc-400">{card.member.jobTitle}</p>
                ) : null}
                {card.member.relationshipHealth ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    {RELATIONSHIP_HEALTH_LABEL[card.member.relationshipHealth] ??
                      card.member.relationshipHealth}
                  </p>
                ) : null}
                {card.dueAt ? (
                  <p className="mt-1 text-xs text-amber-700">
                    Due {new Date(card.dueAt).toLocaleDateString()}
                  </p>
                ) : null}
                {fields.length > 0 ? (
                  <WorkflowCardFields
                    orgSlug={orgSlug}
                    runId={card.id}
                    fields={fields}
                    values={card.fieldValues}
                    compact
                  />
                ) : null}
                {showConvert && (card.stageId === "qualified" || col.stage.id === "qualified") ? (
                  <WorkflowConvertDealButton orgSlug={orgSlug} runId={card.id} />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
