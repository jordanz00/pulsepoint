"use client";

import { useMemo, useState, useTransition } from "react";
import { startTierRenewalCheckout } from "@/app/actions/member-renewal";

export type WorkflowStep = {
  id: string;
  order: number;
  type: "profile" | "dues" | "terms" | "payment" | "welcome" | "custom";
  label: string;
};

type TierOption = {
  id: string;
  name: string;
  priceCents: number;
  billingInterval: string;
  productId: string | null;
};

type StepCategory = "form" | "payment" | "confirmation";

const STEP_CATEGORY: Record<WorkflowStep["type"], StepCategory> = {
  profile: "form",
  dues: "form",
  terms: "form",
  custom: "form",
  payment: "payment",
  welcome: "confirmation",
};

const CATEGORY_META: Record<
  StepCategory,
  { icon: string; label: string; description: string }
> = {
  form: {
    icon: "📋",
    label: "Form",
    description: "Confirm your information before checkout.",
  },
  payment: {
    icon: "💳",
    label: "Payment",
    description: "Secure dues checkout — renewal date updates automatically when paid.",
  },
  confirmation: {
    icon: "✓",
    label: "Confirmation",
    description: "Membership renewed — confirmation on file.",
  },
};

/**
 * Public join/renewal wizard with live Stripe (or demo) dues checkout.
 */
export function RenewalCheckoutWizard({
  orgSlug,
  workflowName,
  steps,
  tiers,
  paid,
  cancelled,
}: {
  orgSlug: string;
  workflowName: string;
  steps: WorkflowStep[];
  tiers: TierOption[];
  paid?: boolean;
  cancelled?: boolean;
}) {
  const ordered = useMemo(
    () => steps.slice().sort((a, b) => a.order - b.order),
    [steps],
  );
  const [index, setIndex] = useState(paid ? ordered.length - 1 : 0);
  const [selectedTierId, setSelectedTierId] = useState(tiers[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const step = ordered[index];
  const category = step ? STEP_CATEGORY[step.type] : "form";
  const meta = CATEGORY_META[category];
  const isLast = index >= ordered.length - 1;
  const selectedTier = tiers.find((t) => t.id === selectedTierId);

  if (ordered.length === 0) {
    return (
      <div className="pc-card text-sm text-[var(--pc-text-secondary)]">
        No active join workflow configured.
      </div>
    );
  }

  function payNow() {
    if (!selectedTierId) {
      setMessage("Select a membership tier.");
      return;
    }
    if (!email.trim()) {
      setMessage("Email is required for renewal receipt and member matching.");
      return;
    }
    startTransition(async () => {
      const res = await startTierRenewalCheckout(orgSlug, selectedTierId, email.trim());
      if (res.ok && res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      setMessage(res.ok ? "Checkout unavailable." : res.error);
    });
  }

  return (
    <div className="space-y-6">
      {paid ? (
        <p className="pc-card text-sm text-[var(--status-live-fg)]">
          Payment received — your renewal date will update shortly. Check your member portal for
          confirmation.
        </p>
      ) : null}
      {cancelled ? (
        <p className="pc-card text-sm text-[var(--pc-text-secondary)]">
          Checkout cancelled. You can try again when ready.
        </p>
      ) : null}

      <div className="pc-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-brand)]">
          {workflowName}
        </p>
        <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
          Step {index + 1} of {ordered.length} · Secure membership renewal
        </p>
        <div className="mt-4 flex gap-1">
          {ordered.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full ${
                i <= index ? "bg-[var(--pc-brand)]" : "bg-[var(--pc-border)]"
              }`}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <div className="pc-card space-y-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--glass-bg-subtle)] text-xl"
            aria-hidden
          >
            {meta.icon}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-text-tertiary)]">
              {meta.label}
            </p>
            <h2 className="text-lg font-semibold">{step?.label}</h2>
            <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">{meta.description}</p>
          </div>
        </div>

        {step?.type === "profile" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="pc-input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="pc-input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              className="pc-input sm:col-span-2"
              type="email"
              placeholder="Email *"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        ) : null}

        {step?.type === "dues" && tiers.length > 0 ? (
          <ul className="space-y-2">
            {tiers.map((t) => (
              <li key={t.id}>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--pc-border)] px-4 py-3 has-[:checked]:border-[var(--pc-brand)]">
                  <span>
                    <span className="font-medium">{t.name}</span>
                    <span className="ml-2 text-sm text-[var(--pc-text-secondary)]">
                      ${(t.priceCents / 100).toFixed(0)}/{t.billingInterval.toLowerCase()}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="tier"
                    value={t.id}
                    checked={selectedTierId === t.id}
                    onChange={() => setSelectedTierId(t.id)}
                    className="h-4 w-4"
                  />
                </label>
              </li>
            ))}
          </ul>
        ) : null}

        {step?.type === "terms" ? (
          <label className="flex items-start gap-3 rounded-xl border border-[var(--pc-border)] bg-[var(--glass-bg-subtle)] p-4 text-sm text-[var(--pc-text-secondary)]">
            <input type="checkbox" required className="mt-1" defaultChecked />
            <span>I agree to the association bylaws and membership terms.</span>
          </label>
        ) : null}

        {step?.type === "payment" ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--pc-text-secondary)]">
              {selectedTier
                ? `${selectedTier.name} — $${(selectedTier.priceCents / 100).toFixed(2)} dues`
                : "Select a tier in the previous step."}
            </p>
            <button
              type="button"
              className="pc-btn-primary w-full"
              disabled={pending || !selectedTier}
              onClick={payNow}
            >
              {pending ? "Starting checkout…" : "Pay membership dues"}
            </button>
          </div>
        ) : null}

        {step?.type === "welcome" ? (
          <p className="text-sm text-[var(--status-live-fg)]">
            Thank you — your membership is active through the next renewal period.
          </p>
        ) : null}

        {message ? <p className="text-sm text-[var(--pc-text-secondary)]">{message}</p> : null}

        {step?.type !== "payment" ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {index > 0 ? (
              <button
                type="button"
                className="pc-btn-secondary"
                onClick={() => setIndex((i) => i - 1)}
              >
                Back
              </button>
            ) : null}
            {!isLast ? (
              <button
                type="button"
                className="pc-btn-primary"
                onClick={() => setIndex((i) => i + 1)}
              >
                Continue
              </button>
            ) : step?.type !== "welcome" ? (
              <button type="button" className="pc-btn-primary" disabled={pending} onClick={payNow}>
                {pending ? "Starting checkout…" : "Complete renewal"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
