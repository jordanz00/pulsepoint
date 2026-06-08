"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import {
  ENTERPRISE_GO_LIVE_STEPS,
  HANDOFF_STEP_DETAILS,
  HANDOFF_SYSTEM_CHIPS,
} from "@/lib/enterprise-integrations-marketing-preview";
import { moduleCssVars } from "@/lib/module-colors";

function statusClass(tone: string) {
  if (tone === "live") return "pp-ei-status--live";
  if (tone === "pilot") return "pp-ei-status--pilot";
  if (tone === "export") return "pp-ei-status--export";
  return "pp-ei-status--shipped";
}

/** One interactive IT handoff card — 4 steps, one detail panel, connected systems. */
export function EnterpriseIntegrationsPreview({
  demoHref = "/demo-healthcare/enterprise/integrations",
}: {
  demoHref?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  const step = ENTERPRISE_GO_LIVE_STEPS[activeStep]!;
  const detail = HANDOFF_STEP_DETAILS[step.id];

  return (
    <div
      className={`pp-ei-handoff mk-liquid-glass pp-glass-interactive pp-ei-preview-shell${ready ? " pp-ei-handoff--ready" : ""}`}
      role="region"
      aria-label="IT go-live handoff preview"
      style={moduleCssVars("work")}
    >
      <div className="pp-ei-handoff-shine" aria-hidden />

      <header className="pp-ei-handoff-head">
        <div>
          <p className="pp-ei-handoff-kicker">IT handoff · 4 steps</p>
          <h3 className="pp-ei-handoff-title">Connect what you already run</h3>
        </div>
        <Link href={demoHref} className="btn btn-primary pp-ei-handoff-cta">
          Open integrations
        </Link>
      </header>

      <div
        className="pp-ei-handoff-steps"
        role="tablist"
        aria-label="Go-live steps"
      >
        {ENTERPRISE_GO_LIVE_STEPS.map((s, i) => {
          const selected = i === activeStep;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`pp-ei-handoff-step${selected ? " is-active" : ""}`}
              style={selected ? moduleCssVars(s.productId) : undefined}
              onClick={() => setActiveStep(i)}
            >
              <span className="pp-ei-handoff-step-num">{s.step}</span>
              <span className="pp-ei-handoff-step-label">{s.title}</span>
              <span className={`pp-ei-status ${statusClass(s.statusTone)}`}>
                {s.statusLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pp-ei-handoff-detail glass pp-glass-surface" aria-live="polite">
        <p className="pp-ei-handoff-detail-title">{step.title}</p>
        <p className="pp-ei-handoff-detail-summary">{detail.summary}</p>
        <ul className="pp-ei-handoff-checklist">
          {detail.checklist.map((item) => (
            <li key={item.label} className={item.done ? "is-done" : "is-todo"}>
              <span className="pp-ei-handoff-check" aria-hidden>
                {item.done ? "✓" : "○"}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
        <p className="pp-ei-handoff-detail-meta">{step.detail}</p>
      </div>

      <div className="pp-ei-handoff-systems">
        <p className="pp-ei-handoff-systems-label">Connected — not replaced</p>
        <ul className="pp-ei-handoff-chips">
          {HANDOFF_SYSTEM_CHIPS.map((chip) => (
            <li key={chip.id} style={moduleCssVars(chip.productId)}>
              <span className="pp-ei-handoff-chip-name">{chip.label}</span>
              <span className={`pp-ei-status ${statusClass(chip.statusTone)}`}>
                {chip.statusLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="pp-ei-handoff-foot">
        <p className="pp-ei-handoff-foot-note">
          Docs: IT-HANDOFF.md · ENTRA-PILOT-SETUP.md · Power BI embed on roadmap
        </p>
      </footer>
    </div>
  );
}
