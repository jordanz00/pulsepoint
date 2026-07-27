"use client";

import { EventsMarketingPreview } from "@/components/marketing/events-marketing-preview";
import { STATIC_DEMO_ORG } from "@/lib/static-demo/seed";

export default function StaticDemoEventsPage() {
  return (
    <div className="space-y-4 p-6 lg:p-8">
      <header>
        <p className="pp-eyebrow">EventCore</p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--pc-text)]">Events</h1>
        <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
          Interactive program preview — illustrative registrations and revenue mix.
        </p>
      </header>
      <EventsMarketingPreview demoHref={`/${STATIC_DEMO_ORG.slug}/events/`} />
    </div>
  );
}
