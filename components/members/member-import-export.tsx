"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { exportMembersCsv, importMembersCsv } from "@/app/actions/members";

export function MemberImportExport() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    const result = await exportMembersCsv();
    if (!result.ok || !result.data) {
      setMessage(!result.ok ? result.error : "Export failed");
      return;
    }
    const blob = new Blob([result.data.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulscore-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Export downloaded");
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const result = await importMembersCsv(text);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(`Imported ${result.data?.imported ?? 0} members`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="secondary" onClick={handleExport}>
        Export CSV
      </Button>
      <label className="inline-flex cursor-pointer items-center">
        <span className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50">
          Import CSV
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleImport(f);
          }}
        />
      </label>
      {message && <span className="text-sm text-zinc-600">{message}</span>}
    </div>
  );
}
