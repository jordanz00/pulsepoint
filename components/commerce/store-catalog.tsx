"use client";

import { useState, useTransition } from "react";
import { createMemberCheckoutSession } from "@/app/actions/commerce";

type StoreProduct = {
  id: string;
  sku: string;
  name: string;
  description: string;
  kind: string;
  priceCents: number;
  currency: string;
};

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/**
 * Public store catalog with Stripe checkout (email optional; Clerk member linked when signed in).
 */
export function StoreCatalog({
  orgSlug,
  products,
  highlightProductId,
  checkoutPath = "store",
  hideEmailInput = false,
}: {
  orgSlug: string;
  products: StoreProduct[];
  highlightProductId?: string;
  /** URL segment after org slug for return URLs (e.g. `portal/store`). */
  checkoutPath?: string;
  hideEmailInput?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function checkout(productId: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    startTransition(async () => {
      const res = await createMemberCheckoutSession(orgSlug, {
        productId,
        quantity: 1,
        successUrl: `${base}/${orgSlug}/${checkoutPath}?paid=1`,
        cancelUrl: `${base}/${orgSlug}/${checkoutPath}?cancelled=1`,
        customerEmail: email.trim() || undefined,
      });
      if (res.ok && res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      setMessage(res.ok ? "Checkout unavailable." : res.error);
    });
  }

  if (products.length === 0) {
    return (
      <p className="pc-card text-sm text-[var(--pc-text-secondary)]">No products available.</p>
    );
  }

  return (
    <div className="space-y-6">
      {hideEmailInput ? null : (
        <div className="pc-card">
          <label className="pc-label" htmlFor="checkout-email">
            Email for receipt (optional if signed in)
          </label>
          <input
            id="checkout-email"
            type="email"
            className="pc-input mt-1 max-w-md"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <li
            key={p.id}
            className={`pc-card flex flex-col ${
              p.id === highlightProductId ? "ring-2 ring-[var(--pc-brand)]" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-text-tertiary)]">
              {p.kind.replace("_", " ")}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{p.name}</h2>
            {p.description ? (
              <p className="mt-2 flex-1 text-sm text-[var(--pc-text-secondary)]">{p.description}</p>
            ) : (
              <div className="flex-1" />
            )}
            <p className="mt-4 text-xl font-bold">{fmt(p.priceCents, p.currency)}</p>
            <button
              type="button"
              className="pc-btn-primary mt-4 w-full"
              disabled={pending}
              onClick={() => checkout(p.id)}
            >
              {pending ? "Starting checkout…" : "Buy now"}
            </button>
          </li>
        ))}
      </ul>
      {message ? <p className="text-sm text-[var(--pc-text-secondary)]">{message}</p> : null}
    </div>
  );
}
