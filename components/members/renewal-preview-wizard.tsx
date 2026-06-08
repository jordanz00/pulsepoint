"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type PreviewWorkflowStep = {
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

const STEP_CATEGORY: Record<PreviewWorkflowStep["type"], StepCategory> = {
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
    description: "Collect or confirm member information.",
  },
  payment: {
    icon: "💳",
    label: "Payment",
    description: "Secure dues checkout via the association store.",
  },
  confirmation: {
    icon: "✓",
    label: "Confirmation",
    description: "Welcome message and receipt confirmation.",
  },
};

/**
 * Public join/renewal wizard — walks through active workflow steps (visual demo).
 */
export function RenewalPreviewWizard({
  orgSlug,
  workflowName,
  steps,
  tiers,
}: {
  orgSlug: string;
  workflowName: string;
  steps: PreviewWorkflowStep[];
  tiers: TierOption[];
}) {
  const ordered = useMemo(
    () => steps.slice().sort((a, b) => a.order - b.order),
    [steps],
  );
  const [index, setIndex] = useState(0);
  const [selectedTierId, setSelectedTierId] = useState(tiers[0]?.id ?? "");

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

  return (
    <div className="space-y-6">
      <div className="pc-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-brand)]">
          {workflowName}
        </p>
        <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
          Step {index + 1} of {ordered.length} · Demo preview (no data saved)
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
            <input className="pc-input" placeholder="First name" disabled defaultValue="Jordan" />
            <input className="pc-input" placeholder="Last name" disabled defaultValue="Member" />
            <input
              className="pc-input sm:col-span-2"
              placeholder="Email"
              disabled
              defaultValue="member@example.com"
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
          <p className="rounded-xl border border-[var(--pc-border)] bg-[var(--glass-bg-subtle)] p-4 text-sm text-[var(--pc-text-secondary)]">
            I agree to the association bylaws and code of conduct (demo checkbox).
          </p>
        ) : null}

        {step?.type === "payment" ? (
          <p className="text-sm text-[var(--pc-text-secondary)]">
            {selectedTier
              ? `Checkout for ${selectedTier.name} — $${(selectedTier.priceCents / 100).toFixed(2)}`
              : "Select a tier in the previous step."}
          </p>
        ) : null}

        {step?.type === "welcome" ? (
          <p className="text-sm text-[var(--status-live-fg)]">
            Welcome! Your membership is active. A confirmation email would be sent here.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          {index > 0 ? (
            <button type="button" className="pc-btn-secondary" onClick={() => setIndex((i) => i - 1)}>
              Back
            </button>
          ) : null}
          {!isLast ? (
            <button type="button" className="pc-btn-primary" onClick={() => setIndex((i) => i + 1)}>
              Continue
            </button>
          ) : (
            <Link
              href={
                selectedTier?.productId
                  ? `/${orgSlug}/store?product=${selectedTier.productId}`
                  : `/${orgSlug}/store`
              }
              className="pc-btn-primary inline-flex items-center"
            >
              Continue to store (demo)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
