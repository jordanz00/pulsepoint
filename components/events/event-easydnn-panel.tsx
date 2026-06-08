"use client";

import { useState, useTransition } from "react";
import { buildEventEasyDnnExport } from "@/app/actions/event-advanced";

export function EventEasyDnnPanel({
  orgSlug,
  eventId,
  lastExportedAt,
  siteUrl,
  eventsPagePath,
}: {
  orgSlug: string;
  eventId: string;
  lastExportedAt: string | null;
  siteUrl: string | null;
  eventsPagePath: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);

  return (
    <section className="ec-panel glass pp-readable-on-light pp-motion-card" id="eventcore-website">
      <h2 className="ec-panel-title">EasyDNN website export</h2>
      <p className="ec-panel-lead">
        Generate an HTML module for your EasyDNN site—speakers, sponsors, agenda, and registration
        CTA. Paste into a DNN HTML module (Source view).
        {lastExportedAt ? ` Last export: ${new Date(lastExportedAt).toLocaleString()}.` : ""}
      </p>
      {siteUrl ? (
        <p className="ec-panel-meta text-sm text-[var(--pc-text-secondary)]">
          DNN site:{" "}
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {siteUrl}
          </a>
          {eventsPagePath ? (
            <>
              {" "}
              ·{" "}
              <a
                href={`${siteUrl.replace(/\/$/, "")}${eventsPagePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Events page
              </a>
            </>
          ) : null}
        </p>
      ) : (
        <p className="ec-panel-meta text-sm text-amber-700">
          No EasyDNN site configured — set URL in{" "}
          <a href={`/${orgSlug}/enterprise/integrations`} className="underline">
            Enterprise integrations
          </a>
          .
        </p>
      )}
      <button
        type="button"
        className="pc-btn-primary"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const res = await buildEventEasyDnnExport(orgSlug, eventId);
            if (!res.ok) {
              setMsg(res.error);
              return;
            }
            setHtml(res.bundle.moduleHtml);
            setMsg("Export ready—copy HTML below.");
          });
        }}
      >
        {pending ? "Building…" : "Generate EasyDNN module"}
      </button>
      {msg ? <p className="ec-feedback">{msg}</p> : null}
      {html ? (
        <div className="mt-4">
          <button
            type="button"
            className="pc-btn-secondary text-sm mb-2"
            onClick={() => navigator.clipboard.writeText(html)}
          >
            Copy HTML to clipboard
          </button>
          <textarea className="ec-input ec-textarea w-full font-mono text-xs" rows={12} readOnly value={html} />
        </div>
      ) : null}
    </section>
  );
}
