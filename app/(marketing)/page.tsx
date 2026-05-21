import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { isDemoModeEnabled } from "@/lib/demo-mode";
import { BetterExperiencesSection } from "@/components/marketing/better-experiences";
import { BuilderAdvantageSection } from "@/components/marketing/builder-advantage";
import { CorePlatformFeaturesSection } from "@/components/marketing/core-platform-features";
import { DifferentiatorsSection } from "@/components/marketing/differentiators";
import { FaqSection } from "@/components/marketing/faq-section";
import { MarketingHero } from "@/components/marketing/hero";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { EventsSpotlightSection } from "@/components/marketing/events-spotlight";
import { CommerceSpotlightSection } from "@/components/marketing/commerce-spotlight";
import { EngageSpotlightSection } from "@/components/marketing/engage-spotlight";
import { InsightsSpotlightSection } from "@/components/marketing/insights-spotlight";
import { WorkSpotlightSection } from "@/components/marketing/work-spotlight";
import { GivingSpotlightSection } from "@/components/marketing/giving-spotlight";
import { LearnSpotlightSection } from "@/components/marketing/learn-spotlight";
import { MembershipSpotlightSection } from "@/components/marketing/membership-spotlight";
import { PlatformIntroSection } from "@/components/marketing/platform-intro";
import { QuickTourSection } from "@/components/marketing/quick-tour";
import { SocialProofStrip } from "@/components/marketing/social-proof";
import { FeaturesCatalogSection } from "@/components/marketing/features-catalog";
import { PersonasSection } from "@/components/marketing/personas-section";
import { AdvanceAssociationSection } from "@/components/marketing/advance-section";
import { VsLegacyStrip } from "@/components/marketing/vs-legacy-strip";
import { LiveModulesStrip } from "@/components/marketing/live-modules-strip";

export default async function MarketingPage() {
  const { userId } = await auth();
  const demoOn = isDemoModeEnabled();

  return (
    <div className="min-h-screen bg-[var(--pc-bg)]">
      <MarketingHeader userId={userId} />
      {demoOn ? (
        <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          <strong className="uppercase tracking-wide">Prototype demo</strong>
          <span className="mx-2">·</span>
          <Link
            href="/demo"
            className="font-semibold underline underline-offset-2 hover:text-amber-700"
          >
            Click through PulsePoint as a seeded healthcare association
          </Link>
          <span className="mx-2">·</span>
          <span>All data is illustrative.</span>
        </div>
      ) : null}
      <MarketingHero userId={userId} />
      <LiveModulesStrip userId={userId} />
      <VsLegacyStrip />
      <PlatformIntroSection />

      <main className="mx-auto max-w-6xl px-6">
        <AdvanceAssociationSection />
        <PersonasSection />
        <FeaturesCatalogSection />
        <CorePlatformFeaturesSection />
        <MembershipSpotlightSection />
        <EventsSpotlightSection />
        <LearnSpotlightSection />
        <GivingSpotlightSection />
        <CommerceSpotlightSection />
        <EngageSpotlightSection />
        <InsightsSpotlightSection />
        <WorkSpotlightSection />
        <BetterExperiencesSection />
        <DifferentiatorsSection />
        <FaqSection />
        <SocialProofStrip />
        <QuickTourSection />
        <div className="pb-20">
          <BuilderAdvantageSection />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>PulsePoint · Association Management Software for healthcare associations</p>
      </footer>
    </div>
  );
}
