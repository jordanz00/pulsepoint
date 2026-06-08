"use client";

import { useState, useTransition } from "react";
import { addEventTicketType } from "@/app/actions/tickets";

type Ticket = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  capacity: number | null;
  active: boolean;
};

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function EventTicketPanel({
  orgSlug,
  eventId,
  tickets,
}: {
  orgSlug: string;
  eventId: string;
  tickets: Ticket[];
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section className="pc-card space-y-4">
      <div>
        <h2 className="pc-section-title">Ticket types</h2>
        <p className="pc-section-lead">Member, early bird, VIP — each with its own price and capacity.</p>
      </div>

      <ul className="pc-simple-list">
        {tickets.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-[var(--pc-text-secondary)]">
                {fmt(t.priceCents)}
                {t.capacity ? ` · ${t.capacity} max` : ""}
                {!t.active ? " · Hidden" : ""}
              </p>
            </div>
          </li>
        ))}
        {tickets.length === 0 ? (
          <li className="px-5 py-4 text-sm text-[var(--pc-text-secondary)]">No ticket types yet.</li>
        ) : null}
      </ul>

      <form
        className="flex flex-wrap gap-2 border-t border-[var(--pc-border)] pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await addEventTicketType(orgSlug, eventId, {
              name: String(fd.get("name") ?? ""),
              description: String(fd.get("description") ?? ""),
              priceCents: Math.round(Number(fd.get("price") ?? 0) * 100),
              capacity: fd.get("capacity") ? Number(fd.get("capacity")) : undefined,
            });
            setMsg(res.ok ? "Ticket added." : res.error);
            e.currentTarget.reset();
          });
        }}
      >
        <input name="name" required placeholder="Ticket name" className="pc-input max-w-[160px]" />
        <input name="price" type="number" min="0" step="0.01" placeholder="Price" className="pc-input w-24" />
        <input name="capacity" type="number" min="1" placeholder="Cap" className="pc-input w-20" />
        <button type="submit" className="pc-btn-secondary text-sm" disabled={pending}>
          Add ticket
        </button>
      </form>
      {msg ? <p className="text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </section>
  );
}
