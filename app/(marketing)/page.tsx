import type { Metadata } from "next";
import { getDemoSession } from "@/lib/demo-mode";
import { isStandalonePrototype } from "@/lib/standalone-prototype";
import { MARKETING_HERO } from "@/lib/marketing-home";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingHeroPremium } from "@/components/marketing/marketing-hero-premium";
import { MarketingJumpNav } from "@/components/marketing/marketing-jump-nav";
import { FlagshipFeaturesSection } from "@/components/marketing/flagship-features-section";
import { VsLegacyPremiumSection } from "@/components/marketing/vs-legacy-premium";
import { SuiteExplorerSection } from "@/components/marketing/suite-explorer-section";
import { MarketingProofBand } from "@/components/marketing/marketing-proof-band";
import { MarketingPersonaStrip } from "@/components/marketing/marketing-persona-strip";
import { EnterpriseHealthcareSection } from "@/components/marketing/enterprise-healthcare-section";
import { SecurityPlatformSection } from "@/components/marketing/security-platform-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { DemoCtaPremium } from "@/components/marketing/demo-cta-premium";
import { MarketingFooterPremium } from "@/components/marketing/marketing-footer-premium";
import { SkipToMain } from "@/components/skip-to-main";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${MARKETING_HERO.headline} — ${MARKETING_HERO.metaTitle}`,
  description: `${MARKETING_HERO.subhead} Microsoft 365, EasyDNN, and board-ready KPIs for hospital associations.`,
  openGraph: {
    title: `${MARKETING_HERO.headline} — ${MARKETING_HERO.metaTitle}`,
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
    resolvedUserId = null;
  }

  return (
    <div className="pp-canvas pp-marketing-canvas min-h-screen">
      <SkipToMain />
      <MarketingHeader userId={resolvedUserId} standalone={standalone} />

      <main id="main-content" className="pp-marketing-main">
        <MarketingHeroPremium userId={resolvedUserId} standalone={standalone} />
        <MarketingJumpNav />
        <FlagshipFeaturesSection />
        <VsLegacyPremiumSection />
        <SuiteExplorerSection />
        <MarketingProofBand />
        <MarketingPersonaStrip />
        <EnterpriseHealthcareSection />
        <SecurityPlatformSection />
        <FaqAccordion />
        <DemoCtaPremium standalone={standalone} />
      </main>
      <MarketingFooterPremium />
    </div>
  );
}
