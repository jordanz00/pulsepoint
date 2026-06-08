"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertWorkflowLeadToDeal } from "@/app/actions/crm-workflows";

export function WorkflowConvertDealButton({
  orgSlug,
  runId,
}: {
  orgSlug: string;
  runId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="mt-2 w-full rounded-md bg-[var(--pc-brand)] px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const res = await convertWorkflowLeadToDeal(orgSlug, runId);
          if (res.ok && res.dealId) {
            router.push(`/${orgSlug}/deals/pipeline`);
          } else {
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Converting…" : "Convert to partnership"}
    </button>
  );
}
