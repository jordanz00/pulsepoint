"use client";

import { useState, useTransition } from "react";
import {
  createEventPromoCode,
  deleteEventPromoCode,
} from "@/app/actions/event-operations";

export type PromoRow = {
  id: string;
  code: string;
  label: string;
  discountPercent: number | null;
  discountCents: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
};

export function EventPromoPanel({
  orgSlug,
  eventId,
  promos,
}: {
  orgSlug: string;
  eventId: string;
  promos: PromoRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section className="ec-panel glass pp-readable-on-light" id="eventcore-promo">
      <h2 className="ec-panel-title">Promo codes</h2>
      <p className="ec-panel-lead">
        Attendees enter codes on the public registration form. Percent or fixed discount
        applies to ticket price.
      </p>

      <form
        className="ec-promo-form grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await createEventPromoCode(orgSlug, eventId, {
              code: String(fd.get("code") ?? ""),
              label: String(fd.get("label") ?? ""),
              discountPercent: fd.get("discountPercent")
                ? Number(fd.get("discountPercent"))
                : null,
              discountCents: fd.get("discountCents")
                ? Math.round(Number(fd.get("discountDollars") ?? 0) * 100)
                : null,
              maxUses: fd.get("maxUses") ? Number(fd.get("maxUses")) : null,
            });
            setMsg(res.ok ? "Promo created." : res.error);
            if (res.ok) e.currentTarget.reset();
          });
        }}
      >
        <input name="code" className="ec-input" placeholder="Code (e.g. EARLYBIRD)" required />
        <input name="label" className="ec-input" placeholder="Label (optional)" />
        <input
          name="discountPercent"
          className="ec-input"
          type="number"
          min={1}
          max={100}
          placeholder="% off"
        />
        <input
          name="discountDollars"
          className="ec-input"
          type="number"
          min={0}
          step="0.01"
          placeholder="$ off"
        />
        <input
          name="maxUses"
          className="ec-input"
          type="number"
          min={1}
          placeholder="Max uses (optional)"
        />
        <button type="submit" className="pc-btn-primary" disabled={pending}>
          Add promo
        </button>
      </form>
      {msg ? <p className="ec-feedback">{msg}</p> : null}

      {promos.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--readable-on-light-muted)]">No promo codes yet.</p>
      ) : (
        <ul className="ec-promo-list mt-4 divide-y rounded-lg border border-[var(--readable-on-light-border)]">
          {promos.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div>
                <span className="font-mono font-bold">{p.code}</span>
                {p.label ? <span className="ml-2 text-[var(--readable-on-light-muted)]">{p.label}</span> : null}
                <p className="text-[var(--readable-on-light-muted)]">
                  {p.discountPercent
                    ? `${p.discountPercent}% off`
                    : p.discountCents
                      ? `$${(p.discountCents / 100).toFixed(2)} off`
                      : "—"}
                  {" · "}
                  Used {p.usedCount}
                  {p.maxUses != null ? ` / ${p.maxUses}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="pc-btn-secondary text-xs"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteEventPromoCode(orgSlug, p.id, eventId);
                  })
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
