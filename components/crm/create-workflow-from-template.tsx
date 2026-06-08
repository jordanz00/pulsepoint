"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkflowFromTemplate } from "@/app/actions/crm-workflows";

export function CreateWorkflowFromTemplate({
  orgSlug,
  templateKey,
}: {
  orgSlug: string;
  templateKey: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="pc-btn-secondary mt-2 text-xs"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createWorkflowFromTemplate(orgSlug, templateKey);
          if (res.ok && res.workflowId) {
            router.push(`/${orgSlug}/crm/workflows/${res.workflowId}`);
          }
        })
      }
    >
      Duplicate template
    </button>
  );
}
