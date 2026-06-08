"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import {
  PAC_ALLOCATION,
  PAC_GOAL_K,
  PAC_GOAL_PCT,
  PAC_LINKED_ISSUES,
  PAC_PREVIEW_CONTRIBUTORS,
  PAC_PREVIEW_LAWMAKERS,
  PAC_REPORT_VIEWS,
  PAC_YTD_RAISED_K,
  type PacReportViewId,
} from "@/lib/pac-marketing-preview";
import { moduleCssVars } from "@/lib/module-colors";

function fmtK(cents: number) {
  return `$${Math.round(cents / 100_000)}K`;
}

function PaceReport() {
  return (
    <div className="pp-pac-report-pace" aria-label="PAC pace vs board goal">
      <div className="pp-pac-report-pace-hero">
        <p className="pp-pac-report-pace-label">Raised this cycle</p>
        <p className="pp-pac-report-pace-value">
          <AnimatedNumber value={PAC_YTD_RAISED_K} prefix="$" suffix="K" />
        </p>
        <p className="pp-pac-report-pace-goal">
          of <AnimatedNumber value={PAC_GOAL_K} prefix="$" suffix="K" /> board goal
        </p>
        <p className="pp-pac-report-pace-pct-line">
          <span className="pp-pac-report-pace-pct-num">{PAC_GOAL_PCT}%</span>
          <span className="pp-pac-report-pace-pct-label"> of board goal</span>
        </p>
      </div>

      <div className="pp-pac-report-goal-track" role="presentation" aria-hidden>
        <div className="pp-pac-report-goal-fill" style={{ width: `${PAC_GOAL_PCT}%` }} />
      </div>

      <div className="pp-pac-report-split" aria-label="State vs federal PAC split">
        {PAC_ALLOCATION.map((row) => (
          <div
            key={row.id}
            className={`pp-pac-report-split-seg pp-pac-report-split-seg--${row.id}`}
            style={{ flexBasis: `${row.pct}%`, ...moduleCssVars(row.productId) }}
          >
            <span className="pp-pac-report-split-pct">{row.pct}%</span>
            <span className="pp-pac-report-split-label">{row.label}</span>
          </div>
        ))}
      </div>

      <ul className="pp-pac-report-pace-stats" aria-label="Cycle summary">
        <li>
          <span className="pp-pac-report-mini-value">4</span>
          <span className="pp-pac-report-mini-label">Policy fights</span>
        </li>
        <li>
          <span className="pp-pac-report-mini-value">28</span>
          <span className="pp-pac-report-mini-label">Lawmaker meetings</span>
        </li>
        <li>
          <span className="pp-pac-report-mini-value">Ahead</span>
          <span className="pp-pac-report-mini-label">Of Q2 target</span>
        </li>
      </ul>
    </div>
  );
}

function GiversReport({
  activeIdx,
  onSelect,
}: {
  activeIdx: number;
  onSelect: (idx: number) => void;
}) {
  const maxK = PAC_PREVIEW_CONTRIBUTORS[0]?.amountK ?? 1;
  const active = PAC_PREVIEW_CONTRIBUTORS[activeIdx]!;

  return (
    <div className="pp-pac-report-givers" aria-label="Top hospital PAC contributors">
      <ul className="pp-pac-report-giver-list">
        {PAC_PREVIEW_CONTRIBUTORS.map((h, i) => {
          const selected = i === activeIdx;
          const width = Math.round((h.amountK / maxK) * 100);
          return (
            <li key={h.id}>
              <button
                type="button"
                className={`pp-pac-report-giver${selected ? " is-active" : ""}`}
                style={selected ? moduleCssVars(h.productId) : undefined}
                onClick={() => onSelect(i)}
                onMouseEnter={() => onSelect(i)}
              >
                <span className="pp-pac-report-giver-name">{h.label}</span>
                <span className="pp-pac-report-giver-amt">${h.amountK}K</span>
                <span className="pp-pac-report-giver-track" aria-hidden>
                  <span className="pp-pac-report-giver-fill" style={{ width: `${width}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="pp-pac-report-giver-detail glass pp-glass-surface" aria-live="polite">
        <p className="pp-pac-report-giver-detail-title">{active.label}</p>
        <p className="pp-pac-report-giver-detail-amt">${active.amountK}K this cycle</p>
        <p className="pp-pac-report-giver-detail-note">Linked to MemberCore roster · sample hospital PAC gift</p>
      </div>
    </div>
  );
}

function PolicyReport({
  activeIssue,
  onSelect,
}: {
  activeIssue: number;
  onSelect: (idx: number) => void;
}) {
  const issue = PAC_LINKED_ISSUES[activeIssue]!;
  const issuePct = Math.round((issue.raisedCents / issue.targetCents) * 100);
  const lawmakers = useMemo(
    () => PAC_PREVIEW_LAWMAKERS.filter((lm) => lm.level === issue.jurisdiction).slice(0, 2),
    [issue.jurisdiction],
  );

  return (
    <div className="pp-pac-report-policy" aria-label="PAC linked to advocacy issues">
      <div className="pp-pac-report-issue-tabs" role="tablist" aria-label="Policy fights">
        {PAC_LINKED_ISSUES.map((row, i) => {
          const selected = i === activeIssue;
          return (
            <button
              key={row.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`pp-pac-report-issue-tab${selected ? " is-active" : ""}`}
              style={selected ? moduleCssVars(row.productId) : undefined}
              onClick={() => onSelect(i)}
              onMouseEnter={() => onSelect(i)}
            >
              <span
                className={`pp-pac-report-jurisdiction pp-pac-report-jurisdiction--${row.jurisdiction.toLowerCase()}`}
              >
                {row.jurisdiction}
              </span>
              {row.title}
            </button>
          );
        })}
      </div>

      <div className="pp-pac-report-policy-stage glass pp-glass-surface">
        <div className="pp-pac-report-issue-card" style={moduleCssVars(issue.productId)}>
          <p className="pp-pac-report-issue-title">{issue.title}</p>
          <p className="pp-pac-report-issue-meta">
            {fmtK(issue.raisedCents)} raised · {issuePct}% of fight goal
          </p>
          <div className="pp-pac-report-issue-track" aria-hidden>
            <span className="pp-pac-report-issue-fill" style={{ width: `${issuePct}%` }} />
          </div>
          <p className="pp-pac-report-issue-note">{issue.politicalNote}</p>
        </div>

        <div className="pp-pac-report-flow" aria-label="Lawmaker touchpoints for selected fight">
          <span className="pp-pac-report-flow-connector" aria-hidden />
          <ul className="pp-pac-report-lawmakers">
            {lawmakers.map((lm) => (
              <li key={lm.id} style={moduleCssVars(lm.productId)}>
                <span className="pp-pac-report-lawmaker-name">{lm.name}</span>
                <span className="pp-pac-report-lawmaker-meta">{lm.meetings} meetings</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Interactive PAC board report — one wow view at a time. */
export function PacMarketingPreview({
  demoHref = "/demo-healthcare/giving",
}: {
  demoHref?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [view, setView] = useState<PacReportViewId>("pace");
  const [activeGiver, setActiveGiver] = useState(0);
  const [activeIssue, setActiveIssue] = useState(0);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  const lens = PAC_REPORT_VIEWS.find((v) => v.id === view)!;

  return (
    <div
      className={`pp-pac-report mk-pac-preview-shell mk-liquid-glass pp-glass-interactive${ready ? " pp-pac-report--ready" : ""}`}
      role="region"
      aria-label="Hospital PAC board report preview"
      style={moduleCssVars("giving")}
    >
      <div className="pp-pac-report-shine" aria-hidden />

      <header className="pp-pac-report-head">
        <div>
          <p className="pp-pac-report-kicker">Board report · sample cycle</p>
          <h3 className="pp-pac-report-title">{lens.label}</h3>
        </div>
        <Link href={demoHref} className="btn btn-primary pp-pac-report-cta">
          Open workspace
        </Link>
      </header>

      <div className="pp-pac-report-lenses" role="tablist" aria-label="Report views">
        {PAC_REPORT_VIEWS.map((item) => {
          const selected = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`pp-pac-report-lens${selected ? " is-active" : ""}`}
              onClick={() => setView(item.id)}
              onMouseEnter={() => setView(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="pp-pac-report-stage" aria-live="polite">
        {view === "pace" ? <PaceReport /> : null}
        {view === "givers" ? (
          <GiversReport activeIdx={activeGiver} onSelect={setActiveGiver} />
        ) : null}
        {view === "policy" ? (
          <PolicyReport activeIssue={activeIssue} onSelect={setActiveIssue} />
        ) : null}
      </div>

      <p className="pp-pac-report-insight">{lens.insight}</p>

      <footer className="pp-pac-report-foot">
        <p className="pp-pac-report-foot-note">
          Sample data only · not a government filing · coordinate with counsel before live PAC
        </p>
      </footer>
    </div>
  );
}
