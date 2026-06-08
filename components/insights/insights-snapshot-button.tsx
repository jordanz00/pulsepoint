"use client";

import { useState, useTransition } from "react";
import { snapshotKpis } from "@/app/actions/insights";

export function InsightsSnapshotButton({ orgSlug }: { orgSlug: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className="pc-btn-primary text-sm"
        onClick={() =>
          startTransition(async () => {
            try {
              const r = await snapshotKpis(orgSlug);
              setMessage(`Captured ${r.snapshots} metric(s).`);
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "Snapshot failed");
            }
          })
        }
      >
        {pending ? "Capturing…" : "Capture snapshot"}
      </button>
      {message && (
        <p className="text-[11px] text-[var(--pc-text-tertiary)]">{message}</p>
      )}
    </div>
  );
}
