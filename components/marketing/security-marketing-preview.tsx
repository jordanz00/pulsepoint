"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import {
  SECURITY_ACCESS_ROLES,
  SECURITY_IMPORT_FLOW,
  SECURITY_SAFEGUARDS,
  SECURITY_VAULT_ORGS,
} from "@/lib/security-marketing-preview";
import { moduleCssVars } from "@/lib/module-colors";

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SafeguardVisual({ id, active }: { id: string; active: boolean }) {
  if (id === "isolation") {
    return (
      <ul className="pp-sec-briefing-vaults" aria-label="Separate association data spaces">
        {SECURITY_VAULT_ORGS.map((org, i) => (
          <li
            key={org.id}
            className={`pp-sec-briefing-vault${active ? " is-live" : ""}`}
            style={moduleCssVars(org.productId)}
          >
            <span className="pp-sec-briefing-vault-lock" aria-hidden>
              <LockIcon />
            </span>
            <span className="pp-sec-briefing-vault-label">{org.label}</span>
            <span className="pp-sec-briefing-vault-meta">Private roster</span>
          </li>
        ))}
      </ul>
    );
  }

  if (id === "access") {
    return (
      <ul className="pp-sec-briefing-roles" aria-label="Role-based access examples">
        {SECURITY_ACCESS_ROLES.map((row) => (
          <li
            key={row.role}
            className={`pp-sec-briefing-role pp-sec-briefing-role--${row.level}${active ? " is-live" : ""}`}
          >
            <span className="pp-sec-briefing-role-name">{row.role}</span>
            <span className="pp-sec-briefing-role-scope">{row.scope}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (id === "imports") {
    return (
      <ol className="pp-sec-briefing-flow" aria-label="Import review flow">
        {SECURITY_IMPORT_FLOW.map((step, i) => (
          <li key={step.step} className={`pp-sec-briefing-flow-step${active ? " is-live" : ""}`}>
            <span className="pp-sec-briefing-flow-num">{i + 1}</span>
            <span className="pp-sec-briefing-flow-title">{step.step}</span>
            <span className="pp-sec-briefing-flow-detail">{step.detail}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={`pp-sec-briefing-receipt${active ? " is-live" : ""}`} aria-label="Payment integrity">
      <div className="pp-sec-briefing-receipt-card">
        <span className="pp-sec-briefing-receipt-label">Registration fee</span>
        <span className="pp-sec-briefing-receipt-amount">$425.00</span>
        <span className="pp-sec-briefing-receipt-status">Charged once · receipt sent</span>
      </div>
      <p className="pp-sec-briefing-receipt-queue">
        Failed charges → <strong>Exceptions</strong> queue
      </p>
    </div>
  );
}

/** One interactive trust briefing — four safeguards, one visual + detail panel. */
export function SecurityMarketingPreview() {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  const safeguard = SECURITY_SAFEGUARDS[active]!;

  return (
    <div
      className={`pp-sec-briefing mk-sec-preview-shell mk-liquid-glass pp-glass-interactive${ready ? " pp-sec-briefing--ready" : ""}`}
      role="region"
      aria-label="Trust and security preview"
      style={moduleCssVars(safeguard.productId)}
    >
      <div className="pp-sec-briefing-shine" aria-hidden />

      <header className="pp-sec-briefing-head">
        <div>
          <p className="pp-sec-briefing-kicker">Platform safeguards · all live</p>
          <h3 className="pp-sec-briefing-title">How your data stays protected</h3>
        </div>
        <span className="badge-live pp-sec-briefing-badge">All live</span>
      </header>

      <div className="pp-sec-briefing-tabs" role="tablist" aria-label="Security safeguards">
        {SECURITY_SAFEGUARDS.map((item, i) => {
          const selected = i === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`pp-sec-briefing-tab${selected ? " is-active" : ""}`}
              style={selected ? moduleCssVars(item.productId) : undefined}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <span className="pp-sec-briefing-tab-chip">{item.chip}</span>
              <span className="pp-sec-briefing-tab-signal">{item.signal.value}</span>
            </button>
          );
        })}
      </div>

      <div className="pp-sec-briefing-body" aria-live="polite">
        <div className="pp-sec-briefing-visual glass pp-glass-surface">
          <p className="pp-sec-briefing-visual-label">{safeguard.chip}</p>
          <SafeguardVisual id={safeguard.id} active={ready} />
        </div>

        <div className="pp-sec-briefing-detail glass pp-glass-surface">
          <p className="pp-sec-briefing-detail-title">{safeguard.title}</p>
          <p className="pp-sec-briefing-detail-summary">{safeguard.summary}</p>
          <ul className="pp-sec-briefing-checklist">
            {safeguard.checklist.map((line) => (
              <li key={line}>
                <span className="pp-sec-briefing-check" aria-hidden>
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="pp-sec-briefing-signals" aria-label="Safeguard summary">
        {SECURITY_SAFEGUARDS.map((item, i) => (
          <li
            key={item.id}
            className={`pp-sec-briefing-signal${i === active ? " is-active" : ""}`}
            style={i === active ? moduleCssVars(item.productId) : undefined}
          >
            <span className="pp-sec-briefing-signal-value">{item.signal.value}</span>
            <span className="pp-sec-briefing-signal-label">{item.signal.label}</span>
          </li>
        ))}
      </ul>

      <footer className="pp-sec-briefing-foot">
        <p className="pp-sec-briefing-foot-note">
          Association membership data—isolated, permissioned, backed up on a schedule.
        </p>
      </footer>
    </div>
  );
}
