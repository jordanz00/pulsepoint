"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adOpsApi } from "@/lib/ad-ops-api";

export function CreativeActions({
  campaignId,
  creatives,
}: {
  campaignId: string;
  creatives: Array<{ id: string; name: string; state: string }>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");

  async function addCreative() {
    if (!name.trim()) return;
    await adOpsApi(`/campaigns/${campaignId}/creatives`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setName("");
    router.refresh();
  }

  async function transition(id: string, state: string, contentForHash?: string) {
    await adOpsApi(`/creatives/${id}/transition`, {
      method: "POST",
      body: JSON.stringify({ state, contentForHash }),
    });
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Creatives (MLR workflow)</h2>
      <p className="muted">Draft → Submitted → MLR Approved → Locked → Trafficked → Live → Retired</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New creative name"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="button" onClick={addCreative}>
          Add
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {creatives.map((c) => (
          <li
            key={c.id}
            style={{
              marginBottom: "0.75rem",
              borderBottom: "1px solid var(--ad-border)",
              paddingBottom: "0.75rem",
            }}
          >
            <strong>{c.name}</strong> <span className="badge">{c.state}</span>
            <div style={{ marginTop: "0.35rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              <button type="button" onClick={() => transition(c.id, "SUBMITTED")}>
                Submit
              </button>
              <button type="button" onClick={() => transition(c.id, "MLR_APPROVED")}>
                MLR approve
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => transition(c.id, "LOCKED", `creative-content-${c.id}-v1`)}
              >
                Lock (hash)
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
