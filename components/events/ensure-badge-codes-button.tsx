"use client";

import { useTransition } from "react";
import { ensureEventBadgeCodes } from "@/app/actions/event-advanced";

export function EnsureBadgeCodesButton({
  orgSlug,
  eventId,
}: {
  orgSlug: string;
  eventId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="pc-btn-secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await ensureEventBadgeCodes(orgSlug, eventId);
        })
      }
    >
      {pending ? "Generating…" : "Generate badge codes"}
    </button>
  );
}
