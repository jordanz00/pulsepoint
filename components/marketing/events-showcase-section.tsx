import { EventsMarketingPreview } from "@/components/marketing/events-marketing-preview";
import { ModuleShowcaseSection } from "@/components/marketing/module-showcase-section";
import { EVENTS_MARKETING } from "@/lib/marketing-home";

export function EventsShowcaseSection() {
  const e = EVENTS_MARKETING;

  return (
    <ModuleShowcaseSection
      id="events"
      eyebrow={e.eyebrow}
      headline={e.headline}
      lead={e.lead}
      capabilities={e.capabilities}
      demoHref={e.demoHref}
      demoLabel={e.demoLabel}
      band={false}
      preview={<EventsMarketingPreview demoHref={e.demoHref} />}
    />
  );
}
