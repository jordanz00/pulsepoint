"use client";

import { useState, useTransition } from "react";
import { saveRenewalWorkflow } from "@/app/actions/renewals";

export type WorkflowStep = {
  id: string;
  order: number;
  type: "profile" | "dues" | "terms" | "payment" | "welcome" | "custom";
  label: string;
};

type StepCategory = "form" | "payment" | "confirmation";

const DEFAULT_STEPS: WorkflowStep[] = [
  { id: "s1", order: 0, type: "profile", label: "Confirm profile" },
  { id: "s2", order: 1, type: "dues", label: "Select membership tier" },
  { id: "s3", order: 2, type: "payment", label: "Pay dues" },
  { id: "s4", order: 3, type: "welcome", label: "Welcome email" },
];

const STEP_TO_CATEGORY: Record<WorkflowStep["type"], StepCategory> = {
  profile: "form",
  dues: "form",
  terms: "form",
  custom: "form",
  payment: "payment",
  welcome: "confirmation",
};

const CATEGORY_META: Record<StepCategory, { icon: string; label: string }> = {
  form: { icon: "📋", label: "Form" },
  payment: { icon: "💳", label: "Payment" },
  confirmation: { icon: "✓", label: "Confirmation" },
};

function stepCategory(type: WorkflowStep["type"]): StepCategory {
  return STEP_TO_CATEGORY[type];
}

/**
 * Staff editor for join/renewal workflow steps with drag reorder and live preview.
 */
export function RenewalWorkflowEditor({
  orgSlug,
  initialName = "Annual renewal",
  initialSteps = DEFAULT_STEPS,
  workflowId,
  previewHref,
}: {
  orgSlug: string;
  initialName?: string;
  initialSteps?: WorkflowStep[];
  workflowId?: string;
  /** Public join page for staff preview link */
  previewHref?: string;
}) {
  const [name, setName] = useState(initialName);
  const [steps, setSteps] = useState(initialSteps);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = steps.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setSteps(next.map((s, i) => ({ ...s, order: i })));
  }

  function onDragStart(i: number) {
    setDragIdx(i);
  }

  function onDrop(i: number) {
    if (dragIdx === null) return;
    reorder(dragIdx, i);
    setDragIdx(null);
  }

  function save() {
    startTransition(async () => {
      const res = await saveRenewalWorkflow(orgSlug, { name, steps }, workflowId);
      setMessage(res.ok ? "Workflow saved." : res.error);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="pc-card space-y-4">
        <div>
          <label className="pc-label" htmlFor="wf-name">
            Workflow name
          </label>
          <input
            id="wf-name"
            className="pc-input mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <p className="text-sm text-[var(--pc-text-secondary)]">
          Drag steps to reorder join or renewal flow. Preview — automated execution ships after pilot.
        </p>
        <ul className="space-y-2">
          {steps.map((step, i) => {
            const cat = stepCategory(step.type);
            const meta = CATEGORY_META[cat];
            return (
              <li
                key={step.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="flex cursor-grab items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-4 py-3 active:cursor-grabbing"
              >
                <span className="text-lg text-[var(--pc-text-tertiary)]" aria-hidden>
                  ⠿
                </span>
                <span className="text-lg" aria-hidden>
                  {meta.icon}
                </span>
                <span className="flex-1 font-medium text-[var(--pc-text)]">{step.label}</span>
                <span className="rounded-full bg-[var(--pc-border)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--pc-text-secondary)]">
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="pc-btn-primary" disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save workflow"}
          </button>
          {previewHref ? (
            <a href={previewHref} className="pc-btn-secondary" target="_blank" rel="noopener noreferrer">
              Preview join flow
            </a>
          ) : null}
        </div>
        {message ? <p className="text-sm text-[var(--pc-text-secondary)]">{message}</p> : null}
      </div>

      <div className="pc-card">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--pc-text-tertiary)]">
          Preview pane
        </h3>
        <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
          How members experience this workflow on the public join page.
        </p>
        <ol className="mt-6 space-y-0">
          {steps.map((step, i) => {
            const cat = stepCategory(step.type);
            const meta = CATEGORY_META[cat];
            const isLast = i === steps.length - 1;
            return (
              <li key={step.id} className="relative flex gap-4 pb-6">
                {!isLast ? (
                  <span
                    className="absolute left-5 top-10 h-full w-px bg-[var(--pc-border)]"
                    aria-hidden
                  />
                ) : null}
                <span
                  className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--pc-brand)] bg-[var(--pc-surface)] text-sm font-bold text-[var(--pc-brand)]"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="flex items-center gap-2 font-medium text-[var(--pc-text)]">
                    <span aria-hidden>{meta.icon}</span>
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-[var(--pc-text-tertiary)]">
                    {meta.label}
                  </p>
                  {cat === "payment" ? (
                    <p className="mt-2 rounded-lg bg-[var(--glass-bg-subtle)] px-3 py-2 text-xs text-[var(--pc-text-secondary)]">
                      Redirects to eStore checkout (Stripe demo)
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
