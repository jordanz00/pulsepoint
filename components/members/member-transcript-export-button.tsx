"use client";

import { useState, useTransition } from "react";
import { exportMemberTranscriptCsv } from "@/app/actions/learn";

export function MemberTranscriptExportButton({
  orgSlug,
  memberId,
  memberName,
}: {
  orgSlug: string;
  memberId: string;
  memberName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="pc-btn-secondary text-sm"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setMsg(null);
            const res = await exportMemberTranscriptCsv(orgSlug, memberId);
            if (!res.ok) {
              setMsg(res.error);
              return;
            }
            const safeName = memberName.replace(/[^\w.-]+/g, "_").slice(0, 40);
            const blob = new Blob([res.data!.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ce-transcript-${safeName}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            setMsg(
              `Downloaded — ${res.data!.enrollmentCount} enrollment(s), ${res.data!.awardCount} credit(s).`,
            );
          });
        }}
      >
        {pending ? "Preparing…" : "Download CE transcript"}
      </button>
      {msg ? (
        <span className="text-xs text-[var(--pc-text-secondary)]" role="status">
          {msg}
        </span>
      ) : null}
    </div>
  );
}
