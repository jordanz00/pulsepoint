"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSequenceFromTemplate, runDueEmailSequences } from "@/app/actions/email-sequences";
import { EMAIL_SEQUENCE_TEMPLATES } from "@/lib/crm/sequence-templates";

export function SequenceTemplatePicker({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="pc-glass-panel rounded-xl p-4">
      <p className="mb-3 text-sm text-zinc-600">
        Start from a pre-designed sequence (Nimble-style templates). Then activate and enroll members.
      </p>
      <div className="flex flex-wrap gap-2">
        {EMAIL_SEQUENCE_TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={pending}
            className="rounded-lg border border-[var(--pc-border)] bg-white px-3 py-2 text-left text-sm hover:border-[var(--pc-brand)] disabled:opacity-50"
            onClick={() =>
              startTransition(async () => {
                await createSequenceFromTemplate(orgSlug, t.key);
                router.refresh();
              })
            }
          >
            <span className="font-medium">{t.name}</span>
            <span className="mt-0.5 block text-xs text-zinc-500">{t.department}</span>
          </button>
        ))}
        <button
          type="button"
          disabled={pending}
          className="rounded-lg border border-dashed border-[var(--pc-border)] px-3 py-2 text-sm text-zinc-600"
          onClick={() =>
            startTransition(async () => {
              await runDueEmailSequences(orgSlug);
              router.refresh();
            })
          }
        >
          Process due sends
        </button>
      </div>
    </div>
  );
}
