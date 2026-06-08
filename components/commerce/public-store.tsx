"use client";

import { useState, useTransition } from "react";
import { startPublicStoreCheckout } from "@/app/actions/commerce";

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  kind: string;
};

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function PublicStore({
  orgSlug,
  products,
}: {
  orgSlug: string;
  products: Product[];
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((p) => (
        <article key={p.id} className="pc-card flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-brand)]">{p.kind}</p>
          <h2 className="mt-2 text-lg font-semibold">{p.name}</h2>
          {p.description ? (
            <p className="mt-2 flex-1 text-sm text-[var(--pc-text-secondary)]">{p.description}</p>
          ) : null}
          <p className="mt-4 text-xl font-bold tabular-nums">{fmt(p.priceCents)}</p>
          <button
            type="button"
            className="pc-btn-primary mt-4 text-sm"
            disabled={pending}
            onClick={() => {
              const email = window.prompt("Email for receipt");
              if (!email) return;
              startTransition(async () => {
                const origin = window.location.origin;
                const res = await startPublicStoreCheckout(orgSlug, {
                  productId: p.id,
                  quantity: 1,
                  successUrl: `${origin}/${orgSlug}/store?paid=1`,
                  cancelUrl: `${origin}/${orgSlug}/store`,
                  customerEmail: email,
                });
                if (!res.ok) {
                  setMsg(res.error);
                  return;
                }
                if (res.redirectUrl) window.location.href = res.redirectUrl;
                else setMsg("Order created. Staff will confirm payment.");
              });
            }}
          >
            Buy now
          </button>
        </article>
      ))}
      {msg ? <p className="col-span-full text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </div>
  );
}
