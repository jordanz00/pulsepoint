"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { moduleCssVars } from "@/lib/module-colors";
import { modGlassKpiProps, modMixSegmentProps } from "@/lib/marketing-module-glass";
import { usePreviewCarousel } from "@/lib/use-preview-carousel";
import {
  MEMBERCORE_PREVIEW_CHIPS,
  MEMBERCORE_PREVIEW_CHROME_PRODUCT_ID,
  MEMBERCORE_PREVIEW_ENGAGEMENT_TIERS,
  MEMBERCORE_PREVIEW_FACILITY_TYPES,
  MEMBERCORE_PREVIEW_KPIS,
  MEMBERCORE_PREVIEW_MEMBERS,
  MEMBERCORE_PREVIEW_MEMBERSHIP_MIX,
  MEMBERCORE_PREVIEW_MIX_PANEL_PRODUCT_ID,
  MEMBERCORE_PREVIEW_FACILITY_PANEL_PRODUCT_ID,
  MEMBERCORE_PREVIEW_PULSE_DIMS,
  MEMBERCORE_PREVIEW_ROLE_GROUPS,
  MEMBERCORE_PREVIEW_SEARCH_PRODUCT_ID,
  MEMBERCORE_PREVIEW_TIMELINE,
  type MembercorePreviewFocus,
  type MembercorePreviewMember,
} from "@/lib/membercore-marketing-preview";

const RENEWAL_LABELS: Record<MembercorePreviewMember["renewalStatus"], string> = {
  current: "Current",
  due_soon: "Due soon",
  lapsed: "Lapsed",
};

function EngagementBadge({ score, tier }: { score: number; tier: MembercorePreviewMember["engagementTier"] }) {
  return (
    <span className={`mk-mc-preview-score mk-mc-preview-score--${tier}`} aria-label={`Engagement ${score}`}>
      {score}
    </span>
  );
}

function MemberRow({
  member,
  spotlight,
  onSelect,
}: {
  member: MembercorePreviewMember;
  spotlight?: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={`mk-mc-preview-row mk-preview-hit${spotlight ? " mk-mc-preview-row--spotlight" : " mk-mc-preview-row--muted"}`}
        style={spotlight ? moduleCssVars(member.productId) : undefined}
        aria-pressed={spotlight}
        onClick={onSelect}
      >
        <div className="mk-mc-preview-avatar" aria-hidden>
          {member.initials}
        </div>
        <div className="mk-mc-preview-row-main">
          <div className="mk-mc-preview-row-top">
            <span className="mk-mc-preview-name">{member.name}</span>
            <span className="mk-mc-preview-badge mk-mc-preview-badge--tier">{member.tier}</span>
          </div>
          <p className="mk-mc-preview-role">
            {member.role} · {member.facility}
          </p>
          <div className="pp-mc-preview-row-tags">
            <span className={`pp-mc-preview-tag pp-mc-preview-tag--${member.renewalStatus}`}>
              {RENEWAL_LABELS[member.renewalStatus]}
            </span>
            {member.portalLinked ? (
              <span className="pp-mc-preview-tag pp-mc-preview-tag--portal">Portal linked</span>
            ) : (
              <span className="pp-mc-preview-tag pp-mc-preview-tag--muted">No portal</span>
            )}
          </div>
        </div>
        <EngagementBadge score={member.engagement} tier={member.engagementTier} />
      </button>
    </li>
  );
}

function DirectoryPanels() {
  const mix = MEMBERCORE_PREVIEW_MEMBERSHIP_MIX;
  const mixSegments = [
    { key: "general", label: "General", ...mix.general },
    { key: "associate", label: "Associate", ...mix.associate },
    { key: "other", label: "Other", ...mix.other },
  ] as const;

  return (
    <div className="mk-mc-preview-analytics-deck" aria-label="Membership analytics">
      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
        style={moduleCssVars(MEMBERCORE_PREVIEW_MIX_PANEL_PRODUCT_ID)}
      >
        <p className="mk-mc-preview-panel-label">Membership mix</p>
        <div className="mk-mc-preview-mix-bar mk-mc-preview-mix-bar--hero" role="group" aria-label="Membership segments">
          {mixSegments.map((s) => {
            const seg = modMixSegmentProps(s.productId, s.pct);
            return <span key={s.key} {...seg} title={`${s.label} ${s.pct}%`} />;
          })}
        </div>
        <ul className="mk-mc-preview-mix-stats">
          {mixSegments.map((s) => (
            <li key={s.key} style={moduleCssVars(s.productId)}>
              <span className="mk-mc-preview-mix-pct">{s.pct}%</span>
              <span className="mk-mc-preview-mix-name">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
        style={moduleCssVars(MEMBERCORE_PREVIEW_FACILITY_PANEL_PRODUCT_ID)}
      >
        <p className="mk-mc-preview-panel-label">By facility type</p>
        <ul className="mk-mc-preview-facility-bars mk-mc-preview-facility-bars--executive">
          {MEMBERCORE_PREVIEW_FACILITY_TYPES.map((f) => (
            <li key={f.id} style={moduleCssVars(f.productId)}>
              <span className="mk-mc-preview-facility-label">{f.label}</span>
              <div className="mk-mc-preview-facility-track">
                <span className="mk-mc-preview-facility-fill" style={{ width: `${f.pct}%` }} />
              </div>
              <span className="mk-mc-preview-facility-count">{f.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EngagementPanels() {
  return (
    <div className="pp-mc-preview-engagement-deck" aria-label="MemberPulse engagement">
      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel pp-mc-preview-panel--full"
        style={moduleCssVars("members")}
      >
        <p className="mk-mc-preview-panel-label">Engagement tiers</p>
        <ul className="pp-mc-preview-tier-bars">
          {MEMBERCORE_PREVIEW_ENGAGEMENT_TIERS.map((t) => (
            <li key={t.id} style={moduleCssVars(t.productId)}>
              <div className="pp-mc-preview-tier-head">
                <span>{t.label}</span>
                <span>
                  {t.count} · {t.pct}%
                </span>
              </div>
              <div className="pp-mc-preview-tier-track">
                <span className="pp-mc-preview-tier-fill" style={{ width: `${t.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel pp-mc-preview-panel--full"
        style={moduleCssVars("insights")}
      >
        <p className="mk-mc-preview-panel-label">Pulse dimensions (sample member)</p>
        <ul className="pp-mc-preview-dims">
          {MEMBERCORE_PREVIEW_PULSE_DIMS.map((d) => (
            <li key={d.id} style={moduleCssVars(d.productId)}>
              <span className="pp-mc-preview-dim-label">{d.label}</span>
              <div className="pp-mc-preview-dim-track">
                <span className="pp-mc-preview-dim-fill" style={{ width: `${d.score}%` }} />
              </div>
              <span className="pp-mc-preview-dim-score">{d.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RolesPanels({ spotlightMember }: { spotlightMember: MembercorePreviewMember }) {
  return (
    <div className="pp-mc-preview-roles-deck" aria-label="Roles and Member 360">
      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
        style={moduleCssVars("crm")}
      >
        <p className="mk-mc-preview-panel-label">Role taxonomy</p>
        <ul className="pp-mc-preview-role-groups">
          {MEMBERCORE_PREVIEW_ROLE_GROUPS.map((g) => (
            <li key={g.id} style={moduleCssVars(g.productId)}>
              <span className="pp-mc-preview-role-count">{g.count}</span>
              <div>
                <p className="pp-mc-preview-role-label">{g.label}</p>
                <p className="pp-mc-preview-role-examples">{g.examples}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
        style={moduleCssVars(spotlightMember.productId)}
      >
        <p className="mk-mc-preview-panel-label">Member 360° · {spotlightMember.name}</p>
        <ul className="pp-mc-preview-timeline">
          {MEMBERCORE_PREVIEW_TIMELINE.map((item) => (
            <li key={item.id} style={moduleCssVars(item.productId)}>
              <span className="pp-mc-preview-timeline-kind">{item.kind}</span>
              <span className="pp-mc-preview-timeline-title">{item.title}</span>
              <span className="pp-mc-preview-timeline-when">{item.when}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MemberCoreMarketingPreview({
  demoHref = "/demo-healthcare/members",
  focus = "directory",
}: {
  demoHref?: string;
  focus?: MembercorePreviewFocus;
}) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [hovering, setHovering] = useState(false);
  const [kpiFocus, setKpiFocus] = useState<number | null>(null);

  const chipCarousel = usePreviewCarousel(MEMBERCORE_PREVIEW_CHIPS.length, 2600, reduced, hovering);
  const rowCarousel = usePreviewCarousel(MEMBERCORE_PREVIEW_MEMBERS.length, 3400, reduced, hovering || chipCarousel.manualPause);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  const activeChip = chipCarousel.index;
  const activeRow = rowCarousel.index;
  const spotlightMember = MEMBERCORE_PREVIEW_MEMBERS[activeRow] ?? MEMBERCORE_PREVIEW_MEMBERS[0]!;

  const chromeTitles: Record<MembercorePreviewFocus, string> = {
    directory: "Member directory",
    engagement: "MemberPulse",
    roles: "Roles & 360°",
  };

  return (
    <div
      className={`mk-mc-preview-shell mk-liquid-glass pp-glass-interactive pp-mc-preview-shell--featured${ready ? " mk-mc-preview-shell--ready" : ""}${chipCarousel.manualPause ? " mk-preview-shell--paused" : ""}`}
      role="region"
      aria-label="Interactive MemberCore preview"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="mk-mc-preview-shine" aria-hidden />
      <div className="mk-preview-ambient" aria-hidden />
      <div className="mk-mc-preview-inner">
        <header className="mk-mc-preview-chrome">
          <div className="mk-mc-preview-chrome-left">
            <FeatureIcon icon="members" productId={MEMBERCORE_PREVIEW_CHROME_PRODUCT_ID} />
            <div>
              <p className="mk-mc-preview-chrome-title">{chromeTitles[focus]}</p>
              <p className="mk-mc-preview-chrome-sub">
                <span className="mk-mc-preview-live-dot" aria-hidden />
                MemberCore · live module
              </p>
            </div>
          </div>
          <Link href={demoHref} className="btn btn-primary mk-mc-preview-cta mk-preview-cta-shine">
            Open workspace
          </Link>
        </header>

        <div className="mk-mc-preview-kpis mk-mc-preview-kpis--executive" aria-label="Roster metrics">
          {MEMBERCORE_PREVIEW_KPIS.map((kpi, i) => {
            const glass = modGlassKpiProps(kpi.productId, kpiFocus === i);
            return (
              <button
                key={kpi.id}
                type="button"
                {...glass}
                className={`${glass.className} mk-preview-hit`}
                aria-pressed={kpiFocus === i}
                onClick={() => {
                  setKpiFocus(i);
                  chipCarousel.pause();
                  rowCarousel.pause();
                }}
              >
                <span className="mk-mc-preview-kpi-label">{kpi.label}</span>
                <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
                  <AnimatedNumber
                    value={kpi.value}
                    prefix={kpi.prefix ?? ""}
                    suffix={kpi.suffix ?? ""}
                    decimals={kpi.decimals ?? 0}
                  />
                </span>
                <span className="mk-mc-preview-kpi-meta">{kpi.meta}</span>
              </button>
            );
          })}
        </div>

        {focus === "directory" ? <DirectoryPanels /> : null}
        {focus === "engagement" ? <EngagementPanels /> : null}
        {focus === "roles" ? <RolesPanels spotlightMember={spotlightMember} /> : null}

        <section className="mk-mc-preview-directory" aria-label="Member directory">
          <button
            type="button"
            className="mk-mc-preview-search mk-mod-glass-panel mk-preview-hit"
            style={moduleCssVars(MEMBERCORE_PREVIEW_SEARCH_PRODUCT_ID)}
            aria-label="Sample search"
            onClick={() => chipCarousel.pause()}
          >
            <span className="mk-mc-preview-search-text">Search name, email, organization, or role…</span>
            <kbd className="mk-mc-preview-search-kbd">⌘K</kbd>
          </button>

          <div className="mk-mc-preview-chips" role="list" aria-label="Sample filters">
            {MEMBERCORE_PREVIEW_CHIPS.map((chip, i) => {
              const active = !reduced && activeChip === i;
              return (
                <button
                  key={chip.label}
                  type="button"
                  role="listitem"
                  className={`mk-mc-preview-chip mk-preview-hit${active ? " mk-mc-preview-chip--active" : ""}`}
                  style={active ? moduleCssVars(chip.productId) : undefined}
                  aria-pressed={active}
                  onClick={() => chipCarousel.pick(i)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <ul className="mk-mc-preview-rows" aria-label="Sample member records">
            {MEMBERCORE_PREVIEW_MEMBERS.map((m, i) => (
              <MemberRow
                key={m.id}
                member={m}
                spotlight={!reduced && activeRow === i}
                onSelect={() => rowCarousel.pick(i)}
              />
            ))}
          </ul>
        </section>

        <footer className="mk-mc-preview-foot">
          <p>Directory · MemberPulse · roles · Member 360° · export</p>
          <p className="mk-mc-preview-disclaimer">Illustrative sample · not your association</p>
        </footer>
      </div>
    </div>
  );
}
