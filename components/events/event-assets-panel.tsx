"use client";

import { useState, useTransition } from "react";
import { addEventAsset, deleteEventAsset } from "@/app/actions/event-advanced";

export type AssetRow = {
  id: string;
  kind: string;
  label: string;
  url: string;
  altText: string;
};

export function EventAssetsPanel({
  orgSlug,
  eventId,
  assets,
}: {
  orgSlug: string;
  eventId: string;
  assets: AssetRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section className="ec-panel glass pp-readable-on-light pp-motion-card" id="eventcore-assets">
      <h2 className="ec-panel-title">Logos & assets</h2>
      <p className="ec-panel-lead">
        Store logo, banner, and sponsor art URLs for microsite, badges, and EasyDNN export. Host
        files in your CMS or CDN, then paste HTTPS links here.
      </p>
      <form
        className="grid gap-3 sm:grid-cols-2 max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await addEventAsset(orgSlug, eventId, {
              kind: String(fd.get("kind")),
              label: String(fd.get("label")),
              url: String(fd.get("url")),
              altText: String(fd.get("altText")),
            });
            setMsg(res.ok ? "Asset added." : res.error);
            if (res.ok) e.currentTarget.reset();
          });
        }}
      >
        <select name="kind" className="ec-input" defaultValue="LOGO">
          <option value="LOGO">Logo</option>
          <option value="BANNER">Banner</option>
          <option value="SPONSOR">Sponsor art</option>
          <option value="BADGE">Badge background</option>
          <option value="GENERAL">General</option>
        </select>
        <input name="label" className="ec-input" placeholder="Label" />
        <input name="url" className="ec-input sm:col-span-2" placeholder="https://…" required type="url" />
        <input name="altText" className="ec-input sm:col-span-2" placeholder="Alt text" />
        <button type="submit" className="pc-btn-primary sm:col-span-2" disabled={pending}>
          Add asset
        </button>
      </form>
      {msg ? <p className="ec-feedback">{msg}</p> : null}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {assets.map((a) => (
          <li key={a.id} className="rounded-lg border p-3 bg-white/80">
            <p className="text-xs font-bold uppercase text-[var(--topic-events-fg)]">{a.kind}</p>
            <p className="font-medium truncate">{a.label || a.url}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.url} alt={a.altText} className="mt-2 max-h-16 object-contain" />
            <button
              type="button"
              className="pc-btn-secondary text-xs mt-2"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteEventAsset(orgSlug, a.id, eventId);
                })
              }
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
