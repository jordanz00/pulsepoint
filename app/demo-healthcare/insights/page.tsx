"use client";

import { InsightsMarketingPreview } from "@/components/marketing/insights-marketing-preview";
import { STATIC_DEMO_ORG } from "@/lib/static-demo/seed";

export default function StaticDemoInsightsPage() {
  return (
    <div className="space-y-4 p-6 lg:p-8">
      <header>
        <p className="pp-eyebrow">Insights</p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--pc-text)]">
          Board-ready KPIs
        </h1>
        <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
          Interactive glance — illustrative revenue and renewal health.
        </p>
      </header>
      <InsightsMarketingPreview demoHref={`/${STATIC_DEMO_ORG.slug}/insights/`} />
    </div>
  );
}
