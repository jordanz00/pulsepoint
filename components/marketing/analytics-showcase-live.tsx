import { InsightsShowcaseSection } from "@/components/marketing/insights-showcase-section";
import { INSIGHTS_MARKETING } from "@/lib/marketing-home";

export function AnalyticsShowcaseLive({ standalone }: { standalone?: boolean }) {
  const demoHref = standalone ? "/demo" : INSIGHTS_MARKETING.demoHref;
  return <InsightsShowcaseSection demoHref={demoHref} />;
}
