"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDealReportDashboard } from "@/app/actions/deal-reports";

export function CreateDashboardForm({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await createDealReportDashboard(orgSlug, { name });
          if (!res.ok) {
            setError(res.error ?? "Failed");
            return;
          }
          if (res.dashboardId) {
            router.push(`/${orgSlug}/deals/reports/${res.dashboardId}`);
          }
        });
      }}
    >
      <label className="text-sm">
        <span className="mb-1 block text-zinc-500">New dashboard name</span>
        <input
          className="pc-input min-w-[14rem]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Regional sales"
          required
        />
      </label>
      <button type="submit" className="pc-btn-primary text-sm" disabled={pending}>
        Create dashboard
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
