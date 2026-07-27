"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PlatformGlanceBriefing } from "@/components/platform/platform-glance-briefing";
import { MemberCoreMarketingPreview } from "@/components/marketing/membercore-marketing-preview";
import { EventsMarketingPreview } from "@/components/marketing/events-marketing-preview";
import { InsightsMarketingPreview } from "@/components/marketing/insights-marketing-preview";
import { STATIC_DEMO_MODULE_STATS, STATIC_DEMO_ORG } from "@/lib/static-demo/seed";

export function StaticDemoCatchAllClient() {
  const params = useParams();
  const rest = params.slug;
  const slugParts = Array.isArray(rest) ? rest : rest ? [rest] : [];
  const head = (slugParts[0] ?? "overview").toLowerCase();
  const orgSlug = STATIC_DEMO_ORG.slug;

  let body: React.ReactNode;
  if (head === "members" || head === "portal") {
    body = <MemberCoreMarketingPreview demoHref={`/${orgSlug}/members/`} />;
  } else if (head === "events") {
    body = <EventsMarketingPreview demoHref={`/${orgSlug}/events/`} />;
  } else if (
    head === "insights" ||
    head === "intelligence" ||
    head === "command-center" ||
    head === "leadership"
  ) {
    body = <InsightsMarketingPreview demoHref={`/${orgSlug}/insights/`} />;
  } else {
    body = <PlatformGlanceBriefing orgSlug={orgSlug} moduleStats={STATIC_DEMO_MODULE_STATS} />;
  }

  return (
    <div className="space-y-4 p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="pp-eyebrow">Module preview</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--pc-text)] capitalize">
            {head.replace(/-/g, " ")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--pc-text-secondary)]">
            Static GitHub Pages demo — interactive UI with illustrative data.
          </p>
        </div>
        <Link href={`/${orgSlug}/suite/`} className="pc-btn-secondary text-sm">
          All modules
        </Link>
      </header>
      {body}
    </div>
  );
}
