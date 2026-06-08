"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function WorkflowViewToggle({
  orgSlug,
  workflowId,
}: {
  orgSlug: string;
  workflowId: string;
}) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "list" ? "list" : "board";
  const base = `/${orgSlug}/crm/workflows/${workflowId}`;

  return (
    <div className="inline-flex rounded-lg border border-[var(--pc-border)] p-0.5">
      <Link
        href={base}
        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
          view === "board" ? "bg-[var(--pc-brand)] text-white" : "text-zinc-600"
        }`}
      >
        Board
      </Link>
      <Link
        href={`${base}?view=list`}
        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
          view === "list" ? "bg-[var(--pc-brand)] text-white" : "text-zinc-600"
        }`}
      >
        List
      </Link>
    </div>
  );
}
