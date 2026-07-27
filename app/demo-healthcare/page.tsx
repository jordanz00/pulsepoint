"use client";

import Link from "next/link";
import {
  STATIC_DEMO_HOME_KPIS,
  STATIC_DEMO_MODULE_STATS,
  STATIC_DEMO_ORG,
} from "@/lib/static-demo/seed";
import { PlatformGlanceBriefing } from "@/components/platform/platform-glance-briefing";
import { walkthroughPageHref } from "@/lib/demo-walkthrough";

export default function StaticDemoHomePage() {
  const orgSlug = STATIC_DEMO_ORG.slug;

  return (
    <div className="pp-admin-glance-page pp-route-enter space-y-8 p-6 lg:p-8">
      <header className="pp-admin-glance-page-head">
        <div>
          <p className="pp-eyebrow">Sterling Healthcare · demo</p>
          <h1 className="pp-admin-glance-page-title">Operations overview</h1>
          <p className="pp-admin-glance-page-lead">
            Same admin chrome as localhost — illustrative sample data in your browser on GitHub Pages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${orgSlug}/suite/`} className="pc-btn-primary text-sm">
            Open suite
          </Link>
          <Link href={walkthroughPageHref(orgSlug, 0)} className="pc-btn-secondary text-sm">
            Guided tour
          </Link>
        </div>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATIC_DEMO_HOME_KPIS.map((kpi) => (
          <li key={kpi.id} className="pc-simple-hero glass pp-glass-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-text-tertiary)]">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--pc-text)]">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-[var(--pc-text-secondary)]">{kpi.hint}</p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--pc-text-tertiary)]">
        Demo preview · illustrative data · not a live association database
      </p>

      <PlatformGlanceBriefing orgSlug={orgSlug} moduleStats={STATIC_DEMO_MODULE_STATS} />
    </div>
  );
}
