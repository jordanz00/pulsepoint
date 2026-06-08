"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportMembersCsv } from "@/app/actions/members";

/** Members list toolbar — export + link to staged import review. */
export function MemberImportExport({
  orgSlug,
  simple = false,
}: {
  orgSlug: string;
  simple?: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    const result = await exportMembersCsv(orgSlug);
    if (!result.ok || !result.data) {
      setMessage(!result.ok ? result.error : "Export failed");
      return;
    }
    const blob = new Blob([result.data.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulsepoint-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Your file was downloaded.");
  }

  if (simple) {
    return (
      <div className="pc-simple-toolbar">
        <Button type="button" variant="secondary" onClick={handleExport}>
          Download list
        </Button>
        <Link href={`/${orgSlug}/members/imports`} className="pc-btn-secondary">
          Import CSV
        </Link>
        {message ? <p className="w-full text-sm text-[var(--pc-text-secondary)]">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="secondary" onClick={handleExport}>
        Export CSV
      </Button>
      <Link href={`/${orgSlug}/members/imports`} className="pc-btn-secondary">
        Import CSV
      </Link>
      {message ? <p className="w-full text-sm text-[var(--pc-text-secondary)]">{message}</p> : null}
    </div>
  );
}
