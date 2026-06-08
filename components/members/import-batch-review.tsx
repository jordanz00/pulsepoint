"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  applyMembersImportBatch,
  rejectMembersImportBatch,
} from "@/app/actions/member-import";

type Row = {
  id: string;
  rowIndex: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  memberStatus: string | null;
  tierName: string | null;
  renewalDueAt: Date | null;
  organizationName: string | null;
  status: string;
};

export function ImportBatchReview({
  orgSlug,
  batch,
}: {
  orgSlug: string;
  batch: {
    id: string;
    fileName: string;
    rowCount: number;
    createdAt: Date;
    rows: Row[];
  };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const pendingRows = batch.rows.filter((r) => r.status === "PENDING");
  const dupRows = batch.rows.filter((r) => r.status === "SKIPPED_DUPLICATE");

  return (
    <section className="pc-glass-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold">
        {batch.fileName || "Import"} · {batch.rowCount} rows
      </h2>
      <p className="text-xs text-zinc-500">
        Uploaded {batch.createdAt.toLocaleString()} · {pendingRows.length} to apply ·{" "}
        {dupRows.length} duplicate emails flagged
      </p>

      <div className="mt-4 max-h-80 overflow-auto rounded border border-zinc-100">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Hospital</th>
              <th className="px-3 py-2">Renewal</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {batch.rows.map((r) => (
              <tr key={r.id} className="border-t border-zinc-100">
                <td className="px-3 py-2">{r.rowIndex + 1}</td>
                <td className="px-3 py-2">
                  {r.firstName} {r.lastName}
                  {r.jobTitle ? (
                    <span className="block text-xs text-zinc-500">{r.jobTitle}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2">{r.email ?? "—"}</td>
                <td className="px-3 py-2 text-xs">{r.tierName ?? "—"}</td>
                <td className="px-3 py-2 text-xs">{r.organizationName ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {r.renewalDueAt ? r.renewalDueAt.toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2 text-xs">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {msg && <p className="mt-3 text-sm text-zinc-600">{msg}</p>}

      <div className="mt-4 flex gap-3">
        <Button
          disabled={pending || pendingRows.length === 0}
          onClick={async () => {
            setPending(true);
            const res = await applyMembersImportBatch(batch.id, orgSlug);
            setPending(false);
            if (!res.ok) {
              setMsg(res.error);
              return;
            }
            setMsg(
              `Applied ${res.data?.applied ?? 0} members (${res.data?.skipped ?? 0} skipped as duplicates).`,
            );
            router.refresh();
          }}
        >
          Apply to members
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={async () => {
            if (!confirm("Reject this import batch?")) return;
            setPending(true);
            await rejectMembersImportBatch(batch.id, orgSlug);
            setPending(false);
            router.refresh();
          }}
        >
          Reject batch
        </Button>
      </div>
    </section>
  );
}
