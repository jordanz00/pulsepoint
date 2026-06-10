"use client";

import { useState, useTransition } from "react";
import { exportPortalTranscriptCsv } from "@/app/actions/portal-learn";

export function PortalTranscriptExportButton({
  orgSlug,
  memberName,
}: {
  orgSlug: string;
  memberName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="portal-transcript-export">
      <button
        type="button"
        className="ds-btn ds-btn--ghost ds-btn--sm"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setMsg(null);
            const res = await exportPortalTranscriptCsv(orgSlug);
            if (!res.ok) {
              setMsg(res.error);
              return;
            }
            const safeName = memberName.replace(/[^\w.-]+/g, "_").slice(0, 40);
            const blob = new Blob([res.data!.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `my-ce-transcript-${safeName}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            setMsg(
              `Downloaded — ${res.data!.enrollmentCount} course(s), ${res.data!.awardCount} credit(s).`,
            );
          });
        }}
      >
        {pending ? "Preparing…" : "Download my CE transcript"}
      </button>
      {msg ? (
        <p className="portal-transcript-export__msg" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
