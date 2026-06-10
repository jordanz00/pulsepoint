"use client";

import { AdvocacyMarketingPreview } from "@/components/marketing/advocacy-marketing-preview";
import { EnterpriseIntegrationsPreview } from "@/components/marketing/enterprise-integrations-preview";
import { EventsMarketingPreview } from "@/components/marketing/events-marketing-preview";
import { InsightsMarketingPreview } from "@/components/marketing/insights-marketing-preview";
import { LearnWorkforceShowcasePreview } from "@/components/marketing/learn-workforce-showcase-preview";
import { MemberCoreMarketingPreview } from "@/components/marketing/membercore-marketing-preview";
import { PacMarketingPreview } from "@/components/marketing/pac-marketing-preview";
import { SuiteModuleViz } from "@/components/marketing/suite-module-viz";
import type { SuiteExplorerPreviewKey } from "@/lib/suite-explorer";
import type { ProductId } from "@/lib/products";

export function SuiteExplorerPreview({
  preview,
  demoHref,
  vizProductId,
}: {
  preview: SuiteExplorerPreviewKey;
  demoHref: string;
  vizProductId?: ProductId;
}) {
  switch (preview) {
    case "members":
      return <MemberCoreMarketingPreview demoHref={demoHref} focus="directory" />;
    case "events":
      return <EventsMarketingPreview demoHref={demoHref} />;
    case "advocacy":
      return <AdvocacyMarketingPreview demoHref={demoHref} focus="campaigns" />;
    case "insights":
      return <InsightsMarketingPreview demoHref={demoHref} focus="revenue" />;
    case "learn":
      return <LearnWorkforceShowcasePreview />;
    case "pac":
      return <PacMarketingPreview demoHref={demoHref} />;
    case "integrations":
      return <EnterpriseIntegrationsPreview demoHref={demoHref} />;
    case "viz":
      return vizProductId ? <SuiteModuleViz productId={vizProductId} /> : null;
    default:
      return null;
  }
}
