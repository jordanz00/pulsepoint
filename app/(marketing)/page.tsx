import type { Metadata } from "next";
import { getDemoSession } from "@/lib/demo-mode";
import { isStandalonePrototype } from "@/lib/standalone-prototype";
import { MARKETING_HERO } from "@/lib/marketing-home";
import { MarketingHeroTourVideo } from "@/components/marketing/marketing-hero-tour-video";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingHeroPremium } from "@/components/marketing/marketing-hero-premium";
import { MarketingJumpNav } from "@/components/marketing/marketing-jump-nav";
import { TrustStripPremium } from "@/components/marketing/trust-strip-premium";
import { WhatIsPulsePointSection } from "@/components/marketing/what-is-pulsepoint-section";
import { EnterpriseHealthcareSection } from "@/components/marketing/enterprise-healthcare-section";
import { AnalyticsShowcaseLive } from "@/components/marketing/analytics-showcase-live";
import { SuiteReadinessBand } from "@/components/marketing/suite-readiness-band";
import { FeatureMatrixSection } from "@/components/marketing/feature-matrix-section";
import { AmsCrmBand } from "@/components/marketing/ams-crm-band";
import { MemberCoreShowcaseSection } from "@/components/marketing/membercore-showcase-section";
import { EventsShowcaseSection } from "@/components/marketing/events-showcase-section";
import { LearnWorkforceShowcaseSection } from "@/components/marketing/learn-workforce-showcase-section";
import { AdvocacyShowcaseSection } from "@/components/marketing/advocacy-showcase-section";
import { PacShowcaseSection } from "@/components/marketing/pac-showcase-section";
import { EnterpriseIntegrationsShowcaseSection } from "@/components/marketing/enterprise-integrations-showcase-section";
import { VsLegacyPremiumSection } from "@/components/marketing/vs-legacy-premium";
import { SecurityPlatformSection } from "@/components/marketing/security-platform-section";
import { AtAGlancePremiumSection } from "@/components/marketing/at-a-glance-premium-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { DemoCtaPremium } from "@/components/marketing/demo-cta-premium";
import { MarketingFooterPremium } from "@/components/marketing/marketing-footer-premium";
import { SkipToMain } from "@/components/skip-to-main";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `PulsePoint — ${MARKETING_HERO.headline}`,
  description: `${MARKETING_HERO.subhead} Microsoft 365, EasyDNN, and board-ready KPIs for hospital associations.`,
  openGraph: {
    title: `PulsePoint — ${MARKETING_HERO.headline}`,
    description: MARKETING_HERO.subhead,
    type: "website",
  },
};

export default async function MarketingPage() {
  const standalone = isStandalonePrototype();
  let resolvedUserId: string | null = null;
  try {
    if (standalone) {
      resolvedUserId = (await getDemoSession())?.userId ?? null;
    } else {
      const { auth } = await import("@clerk/nextjs/server");
      resolvedUserId = (await auth()).userId ?? null;
    }
  } catch {
    // Never blank the marketing homepage if auth/session lookup fails locally.
    resolvedUserId = null;
  }

  return (
    <div className="pp-canvas pp-marketing-canvas min-h-screen">
      <SkipToMain />
      <MarketingHeader userId={resolvedUserId} standalone={standalone} />

      <main id="main-content" className="pp-marketing-main">
        <MarketingHeroPremium userId={resolvedUserId} standalone={standalone} />
        <MarketingJumpNav />
        <VsLegacyPremiumSection />
        <MarketingHeroTourVideo />
        <TrustStripPremium />
        <WhatIsPulsePointSection />
        <EnterpriseHealthcareSection />
        <AnalyticsShowcaseLive standalone={standalone} />
        <SuiteReadinessBand />
        <FeatureMatrixSection />
        <AmsCrmBand />
        <MemberCoreShowcaseSection />
        <EventsShowcaseSection />
        <LearnWorkforceShowcaseSection />
        <AdvocacyShowcaseSection />
        <PacShowcaseSection />
        <EnterpriseIntegrationsShowcaseSection />
        <SecurityPlatformSection />
        <AtAGlancePremiumSection />
        <FaqAccordion />
        <DemoCtaPremium standalone={standalone} />
      </main>
      <MarketingFooterPremium />
    </div>
  );
}
