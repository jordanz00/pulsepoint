/**
 * Phase 4 — platform SaaS subscription placeholder (Stripe Billing Portal / Checkout TBD)
 */

import Link from "next/link";

export default function PlatformBillingPage() {
  const priceId = process.env.STRIPE_PLATFORM_PRICE_ID;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-bold">PulseCore platform billing</h1>
      <p className="mt-3 text-zinc-600">
        Subscribe your association to PulseCore. Wire{" "}
        <code className="rounded bg-zinc-100 px-1">STRIPE_PLATFORM_PRICE_ID</code> and
        a Checkout Session in Phase 4 production launch.
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        Status: {priceId ? "Price ID configured (checkout not wired in v0.1)" : "Not configured"}
      </p>
      <Link href="/" className="mt-8 inline-block text-teal-700 underline">
        ← Back to home
      </Link>
    </div>
  );
}
