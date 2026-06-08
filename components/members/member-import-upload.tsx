"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getMemberImportTemplate,
  stageMembersCsvImport,
} from "@/app/actions/member-import";
import { MEMBER_IMPORT_TEMPLATE_HEADER } from "@/lib/member-import-csv";

export function MemberImportUpload({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setPending(true);
    setError(null);
    const text = await file.text();
    const result = await stageMembersCsvImport(text, orgSlug, file.name);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.data?.largeImport) {
      setError(
        `Large import (${result.data.rowCount.toLocaleString()} rows). Preview shows first 100 rows in review.`,
      );
    }
    router.refresh();
  }

  async function downloadTemplate() {
    const result = await getMemberImportTemplate();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!result.data) {
      setError("Template download failed");
      return;
    }
    const blob = new Blob([result.data.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulsepoint-member-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="pc-glass-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--pc-text)]">Upload CSV</h2>
      <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
        Required: <code className="text-xs">firstName</code>,{" "}
        <code className="text-xs">lastName</code>. Up to 10,000 rows per file. Files over
        5,000 rows show a preview of the first 100 rows while all rows are staged.
      </p>
      <p className="mt-2 text-xs text-[var(--pc-text-tertiary)] font-mono break-all">
        {MEMBER_IMPORT_TEMPLATE_HEADER}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="pc-btn-secondary cursor-pointer">
          {pending ? "Uploading…" : "Choose CSV file"}
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </label>
        <Button type="button" variant="secondary" onClick={() => void downloadTemplate()}>
          Download template
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
