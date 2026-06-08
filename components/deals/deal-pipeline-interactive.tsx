"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveDealStage } from "@/app/actions/deals";
import { DEAL_STAGE_LABEL, ACTIVE_DEAL_STAGES } from "@/lib/deals/constants";
import type { DealStage } from "@/app/generated/prisma/client";

type DealRow = {
  id: string;
  title: string;
  amountCents: number;
  stage: string;
  assigneeName: string;
};

export function DealPipelineInteractive({
  orgSlug,
  deals,
}: {
  orgSlug: string;
  deals: DealRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const columns = [...ACTIVE_DEAL_STAGES, "WON" as const, "LOST" as const];

  function onDrop(stage: DealStage) {
    if (!dragId) return;
    startTransition(async () => {
      await moveDealStage(orgSlug, dragId, stage);
      setDragId(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 overflow-x-auto lg:grid-cols-3 xl:grid-cols-6">
      {columns.map((stage) => {
        const col = deals.filter((d) => d.stage === stage);
        return (
          <div
            key={stage}
            className="min-w-[12rem] rounded-xl border border-[var(--pc-border)] bg-white/60 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(stage as DealStage)}
          >
            <h3 className="text-sm font-semibold text-zinc-800">
              {DEAL_STAGE_LABEL[stage] ?? stage}
              <span className="ml-1 text-zinc-400">({col.length})</span>
            </h3>
            <ul className="mt-3 space-y-2">
              {col.map((d) => (
                <li
                  key={d.id}
                  draggable={!pending}
                  onDragStart={() => setDragId(d.id)}
                  className="cursor-grab rounded-lg border border-[var(--pc-border)]/80 bg-white p-2 text-sm active:cursor-grabbing"
                >
                  <p className="font-medium text-zinc-900">{d.title}</p>
                  <p className="text-xs text-zinc-500">
                    ${(d.amountCents / 100).toLocaleString()} · {d.assigneeName || "Unassigned"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
