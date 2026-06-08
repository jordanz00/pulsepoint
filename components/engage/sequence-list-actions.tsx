"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { activateEmailSequence } from "@/app/actions/email-sequences";

export function SequenceActivateButton({
  orgSlug,
  sequenceId,
  status,
}: {
  orgSlug: string;
  sequenceId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "ACTIVE") {
    return <span className="text-xs text-emerald-700">Active</span>;
  }

  return (
    <button
      type="button"
      className="text-sm text-[var(--pc-brand)] hover:underline disabled:opacity-50"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await activateEmailSequence(orgSlug, sequenceId);
          router.refresh();
        })
      }
    >
      Activate
    </button>
  );
}
