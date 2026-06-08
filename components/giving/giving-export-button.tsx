"use client";

import { useState, useTransition } from "react";
import { exportDonorsCsv } from "@/app/actions/giving";

export function GivingExportButton({ orgSlug }: { orgSlug: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="giving-export">
      <button
        type="button"
        className="giving-export__btn"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const res = await exportDonorsCsv(orgSlug);
            if (!res.ok) {
              setMsg(res.error);
              return;
            }
            const blob = new Blob([res.data!.csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `donors-${orgSlug}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            setMsg(`Exported ${res.data!.count} gifts.`);
          });
        }}
      >
        {pending ? "Exporting…" : "Export CSV"}
      </button>
      {msg ? (
        <span className="giving-export__msg" role="status">
          {msg}
        </span>
      ) : null}
    </div>
  );
}
