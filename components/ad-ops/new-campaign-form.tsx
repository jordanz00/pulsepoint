"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adOpsApi } from "@/lib/ad-ops-api";
import { adOpsPaths } from "@/lib/ad-ops-paths";

export function NewCampaignForm({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const paths = adOpsPaths(orgSlug);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const end = new Date();
    end.setMonth(end.getMonth() + 2);
    try {
      const c = await adOpsApi<{ id: string }>("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name: fd.get("name"),
          clientName: fd.get("clientName"),
          budgetUsd: Number(fd.get("budgetUsd")),
          flightStart: new Date().toISOString().slice(0, 10),
          flightEnd: end.toISOString().slice(0, 10),
        }),
      });
      router.push(paths.campaign(c.id));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card">
      <h2>New campaign brief</h2>
      <form onSubmit={onSubmit} className="grid2">
        <label>
          Name
          <br />
          <input name="name" required style={{ width: "100%", padding: "0.5rem" }} />
        </label>
        <label>
          Client
          <br />
          <input name="clientName" required style={{ width: "100%", padding: "0.5rem" }} />
        </label>
        <label>
          Budget USD
          <br />
          <input name="budgetUsd" type="number" required min={1} style={{ width: "100%", padding: "0.5rem" }} />
        </label>
        <div style={{ alignSelf: "end" }}>
          <button type="submit" className="primary" disabled={pending}>
            {pending ? "Creating…" : "Create draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
