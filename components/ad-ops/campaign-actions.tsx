"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adOpsApi } from "@/lib/ad-ops-api";

const CAMPAIGN_STATES = [
  "DRAFT",
  "QA",
  "APPROVED",
  "READY_TO_TRAFFIC",
  "SYNCED",
  "LIVE",
  "OPTIMIZING",
  "COMPLETED",
  "ARCHIVED",
];

export function CampaignActions({
  campaignId,
  state,
  readiness,
}: {
  campaignId: string;
  state: string;
  readiness: { ready: boolean; reasons: string[] };
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [npiLines, setNpiLines] = useState("1467560003\n1942998830");

  async function act(path: string, body?: object) {
    setMsg(null);
    try {
      await adOpsApi(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      router.refresh();
      setMsg("Done.");
    } catch (e) {
      const err = e as { message?: string; code?: string };
      setMsg(`${err.code ?? "Error"}: ${err.message}`);
    }
  }

  return (
    <div className="card">
      <h2>Workflow actions</h2>
      {!readiness.ready && state !== "DRAFT" && (
        <p className="muted">Ready check: {readiness.reasons.join(" · ") || "OK"}</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <select id="next-state" defaultValue="">
          <option value="">Transition to…</option>
          {CAMPAIGN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const sel = document.getElementById("next-state") as HTMLSelectElement;
            if (sel.value) act(`/campaigns/${campaignId}/transition`, { state: sel.value });
          }}
        >
          Apply state
        </button>
        <button type="button" onClick={() => act(`/campaigns/${campaignId}/qa/audience`)}>
          ✓ Audience QA
        </button>
        <button type="button" onClick={() => act(`/campaigns/${campaignId}/qa/budget`)}>
          ✓ Budget QA
        </button>
        <button type="button" onClick={() => act(`/campaigns/${campaignId}/qa/creative`)}>
          ✓ Creative QA
        </button>
        <button type="button" className="primary" onClick={() => act(`/campaigns/${campaignId}/sync`)}>
          Sync to PulsePoint
        </button>
        <button
          type="button"
          onClick={() => act(`/campaigns/${campaignId}/reconcile`, { metricKey: "spend_usd" })}
        >
          Reconcile spend
        </button>
        <button type="button" onClick={() => act(`/campaigns/${campaignId}/pacing/evaluate`)}>
          Evaluate pacing
        </button>
      </div>

      <h3>NPI pre-flight</h3>
      <textarea
        value={npiLines}
        onChange={(e) => setNpiLines(e.target.value)}
        rows={4}
        style={{ width: "100%", fontFamily: "monospace", fontSize: "0.85rem" }}
      />
      <button
        type="button"
        style={{ marginTop: "0.5rem" }}
        onClick={() =>
          act(`/campaigns/${campaignId}/audience/validate`, {
            filename: "upload.txt",
            lines: npiLines.split("\n"),
            suppressionVersion: "v1",
          })
        }
      >
        Validate NPI list
      </button>

      {msg && <p style={{ marginTop: "1rem" }}>{msg}</p>}
    </div>
  );
}
