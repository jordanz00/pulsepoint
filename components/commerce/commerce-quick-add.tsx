"use client";

import { useState, useTransition } from "react";
import { createProduct, startCheckout } from "@/app/actions/commerce";

export function CommerceQuickAdd({
  orgSlug,
  products,
}: {
  orgSlug: string;
  products: { id: string; name: string; sku: string; priceCents: number; currency: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="pc-card"
        action={(form) =>
          startTransition(async () => {
            const r = await createProduct(orgSlug, {
              sku: String(form.get("sku") ?? ""),
              name: String(form.get("name") ?? ""),
              description: String(form.get("description") ?? ""),
              kind: String(form.get("kind") ?? "OTHER"),
              priceCents: Number(form.get("priceCents") ?? 0),
              currency: String(form.get("currency") ?? "usd"),
              glCode: String(form.get("glCode") ?? "") || undefined,
              active: form.get("active") === "on",
            });
            setMessage(r.ok ? "Product saved." : r.error);
          })
        }
      >
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">New product</h3>
        <div className="mt-3 grid gap-2">
          <input name="sku" required placeholder="SKU (DUES-2026)" className="rounded-md border px-3 py-2 text-sm" />
          <input name="name" required placeholder="Name" className="rounded-md border px-3 py-2 text-sm" />
          <input name="description" placeholder="Description" className="rounded-md border px-3 py-2 text-sm" />
          <select name="kind" className="rounded-md border px-3 py-2 text-sm">
            <option value="DUES">Dues</option>
            <option value="MERCHANDISE">Merchandise</option>
            <option value="SPONSORSHIP">Sponsorship</option>
            <option value="OTHER">Other</option>
          </select>
          <input name="priceCents" type="number" min={0} required placeholder="Price in cents (e.g. 12500)" className="rounded-md border px-3 py-2 text-sm" />
          <input name="currency" defaultValue="usd" className="rounded-md border px-3 py-2 text-sm" />
          <input name="glCode" placeholder="GL code (optional)" className="rounded-md border px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Active</label>
        </div>
        <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
          {pending ? "Saving…" : "Save product"}
        </button>
      </form>

      <form
        className="pc-card"
        action={(form) =>
          startTransition(async () => {
            const r = await startCheckout(orgSlug, {
              productId: String(form.get("productId") ?? ""),
              quantity: Number(form.get("quantity") ?? 1),
              successUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/${orgSlug}/commerce?status=ok`,
              cancelUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/${orgSlug}/commerce?status=cancel`,
              customerEmail: String(form.get("customerEmail") ?? "") || undefined,
            });
            if (!r.ok) { setMessage(r.error); return; }
            if (r.redirectUrl) {
              window.location.href = r.redirectUrl;
            } else {
              setMessage(`Order ${r.orderId} pending — manual adapter (no redirect URL). Mark paid from order list once funds clear.`);
            }
          })
        }
      >
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">Start checkout (test)</h3>
        <div className="mt-3 grid gap-2">
          <select name="productId" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>
            ))}
          </select>
          <input name="quantity" type="number" min={1} defaultValue={1} className="rounded-md border px-3 py-2 text-sm" />
          <input name="customerEmail" type="email" placeholder="Customer email (optional)" className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
          {pending ? "Starting…" : "Start checkout"}
        </button>
      </form>

      {message && <p className="text-xs text-[var(--pc-text-secondary)] lg:col-span-2">{message}</p>}
    </div>
  );
}
