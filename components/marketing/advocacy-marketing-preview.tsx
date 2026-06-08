"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import {
  ADVOCACY_PREVIEW_AGENDA,
  ADVOCACY_PREVIEW_BILLS,
  ADVOCACY_PREVIEW_CAMPAIGNS,
  ADVOCACY_PREVIEW_ISSUES,
  ADVOCACY_PREVIEW_KPIS,
  ADVOCACY_PREVIEW_ROSTER,
  type AdvocacyPreviewFocus,
} from "@/lib/advocacy-marketing-preview";
import { moduleCssVars } from "@/lib/module-colors";
import { modGlassKpiProps, modMixSegmentProps } from "@/lib/marketing-module-glass";

function IssuesPanels({ issueFocus, onSelect }: { issueFocus: number; onSelect: (i: number) => void }) {
  return (
    <>
      <div className="mk-mc-preview-analytics-deck">
        <div
          className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
          style={moduleCssVars("advocacy")}
        >
          <p className="mk-mc-preview-panel-label">Agenda focus</p>
          <div className="mk-mc-preview-mix-bar mk-mc-preview-mix-bar--hero" role="presentation">
            {ADVOCACY_PREVIEW_AGENDA.map((s) => {
              const seg = modMixSegmentProps(s.productId, s.pct);
              return <span key={s.label} {...seg} title={`${s.label} ${s.pct}%`} />;
            })}
          </div>
          <ul className="mk-mc-preview-mix-stats">
            {ADVOCACY_PREVIEW_AGENDA.map((s) => (
              <li key={s.label} style={moduleCssVars(s.productId)}>
                <span className="mk-mc-preview-mix-pct">{s.pct}%</span>
                <span className="mk-mc-preview-mix-name">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
          style={moduleCssVars("crm")}
        >
          <p className="mk-mc-preview-panel-label">Bill tracker</p>
          <ul className="pp-adv-preview-bills">
            {ADVOCACY_PREVIEW_BILLS.map((b) => (
              <li key={b.id} style={moduleCssVars(b.productId)}>
                <span className="pp-adv-preview-bill-label">{b.label}</span>
                <span className="pp-adv-preview-bill-meta">
                  {b.chamber} · {b.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <section className="mk-adv-preview-issues" aria-label="Priority issues">
        <p className="mk-mc-preview-panel-label">Priority issues</p>
        <ul className="mk-adv-preview-issue-list">
          {ADVOCACY_PREVIEW_ISSUES.map((issue, i) => (
            <li key={issue.id}>
              <button
                type="button"
                className={`mk-adv-preview-issue mk-preview-hit${issueFocus === i ? " is-active" : ""}`}
                style={issueFocus === i ? moduleCssVars(issue.productId) : undefined}
                aria-pressed={issueFocus === i}
                onClick={() => onSelect(i)}
              >
                <span
                  className={`mk-adv-preview-jurisdiction mk-adv-preview-jurisdiction--${issue.jurisdiction.toLowerCase()}`}
                >
                  {issue.jurisdiction}
                </span>
                <span className="mk-adv-preview-issue-main">
                  <span className="mk-adv-preview-issue-title">{issue.title}</span>
                  <span className="mk-adv-preview-issue-meta">
                    {issue.status}
                    {issue.bill ? ` · ${issue.bill}` : ""}
                    {` · ${issue.priority}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function CampaignsPanels() {
  return (
    <div
      className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel pp-adv-preview-panel--full"
      style={moduleCssVars("engage")}
    >
      <p className="mk-mc-preview-panel-label">Active take-action campaigns</p>
      <ul className="mk-adv-preview-campaigns">
        {ADVOCACY_PREVIEW_CAMPAIGNS.map((c) => {
          const pct = Math.round((c.responses / c.target) * 100);
          return (
            <li key={c.id} style={moduleCssVars(c.productId)}>
              <div className="mk-adv-preview-campaign-head">
                <span className="mk-adv-preview-campaign-name">{c.name}</span>
                <span className="mk-adv-preview-campaign-count">
                  {c.responses}/{c.target}
                </span>
              </div>
              <div className="pp-adv-preview-campaign-meta">
                <span>Due {c.deadline}</span>
                <span>{pct}% of target</span>
              </div>
              <div className="mk-mc-preview-facility-track">
                <span className="mk-mc-preview-facility-fill" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RosterPanels() {
  return (
    <div
      className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel pp-adv-preview-panel--full"
      style={moduleCssVars("members")}
    >
      <p className="mk-mc-preview-panel-label">Participation by member organization</p>
      <ul className="pp-adv-preview-roster">
        {ADVOCACY_PREVIEW_ROSTER.map((row) => (
          <li key={row.id} style={moduleCssVars(row.productId)}>
            <span className="pp-adv-preview-roster-org">{row.organization}</span>
            <span className="pp-adv-preview-roster-stats">
              {row.responses} responses · {row.executives} executives
            </span>
          </li>
        ))}
      </ul>
      <p className="pp-adv-preview-roster-note">
        Linked to MemberCore — same organizations your GR and PAC teams reference.
      </p>
    </div>
  );
}

export function AdvocacyMarketingPreview({
  demoHref = "/demo-healthcare/enterprise/advocacy",
  focus = "issues",
}: {
  demoHref?: string;
  focus?: AdvocacyPreviewFocus;
}) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [issueFocus, setIssueFocus] = useState(0);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  const chromeTitles: Record<AdvocacyPreviewFocus, string> = {
    issues: "Issue intelligence",
    campaigns: "Take-action campaigns",
    roster: "Roster participation",
  };

  return (
    <div
      className={`mk-adv-preview-shell mk-liquid-glass pp-glass-interactive pp-adv-preview-shell--featured${ready ? " mk-adv-preview-shell--ready" : ""}`}
      role="region"
      aria-label="Interactive Advocacy preview"
    >
      <div className="mk-mc-preview-shine" aria-hidden />
      <div className="mk-preview-ambient" aria-hidden />
      <div className="mk-mc-preview-inner">
        <header className="mk-mc-preview-chrome">
          <div className="mk-mc-preview-chrome-left">
            <FeatureIcon icon="advocacy" productId="advocacy" />
            <div>
              <p className="mk-mc-preview-chrome-title">{chromeTitles[focus]}</p>
              <p className="mk-mc-preview-chrome-sub">
                <span className="mk-mc-preview-live-dot mk-adv-preview-live-dot" aria-hidden />
                Advocacy · alpha preview
              </p>
            </div>
          </div>
          <Link href={demoHref} className="btn btn-primary mk-mc-preview-cta mk-preview-cta-shine">
            Open workspace
          </Link>
        </header>

        <div className="mk-mc-preview-kpis mk-mc-preview-kpis--executive" aria-label="Advocacy metrics">
          {ADVOCACY_PREVIEW_KPIS.map((kpi, i) => {
            const glass = modGlassKpiProps(kpi.productId, issueFocus === i && focus === "issues");
            return (
              <button
                key={kpi.id}
                type="button"
                {...glass}
                className={`${glass.className} mk-preview-hit`}
                aria-pressed={issueFocus === i && focus === "issues"}
                onClick={() => setIssueFocus(i)}
              >
                <span className="mk-mc-preview-kpi-label">{kpi.label}</span>
                <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
                  <AnimatedNumber value={kpi.value} />
                </span>
                <span className="mk-mc-preview-kpi-meta">{kpi.meta}</span>
              </button>
            );
          })}
        </div>

        {focus === "issues" ? (
          <IssuesPanels issueFocus={issueFocus} onSelect={setIssueFocus} />
        ) : null}
        {focus === "campaigns" ? <CampaignsPanels /> : null}
        {focus === "roster" ? <RosterPanels /> : null}

        <footer className="mk-mc-preview-foot">
          <p>Issues · campaigns · roster · PAC alignment</p>
          <p className="mk-mc-preview-disclaimer">Illustrative sample · alpha preview</p>
        </footer>
      </div>
    </div>
  );
}
