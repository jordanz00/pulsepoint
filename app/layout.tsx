import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import { MARKETING_HERO } from "@/lib/marketing-home";
import { DemoBanner } from "@/components/demo-banner";
import { fontClassNames } from "@/components/pulse-fonts";
import "./globals.css";
import "./pulse-surfaces.css";
import "./admin-surfaces.css";
import "./design-system.css";
import "./flagship-features.css";
import "./liquid-glass-overhaul.css";
import "./why-pulsepoint-flagship.css";
import "./marketing-showcases.css";
import "./marketing-sell.css";
import "./enterprise-foundation.css";

export const metadata: Metadata = {
  title: `${MARKETING_HERO.headline} — ${MARKETING_HERO.metaTitle}`,
  description: MARKETING_HERO.subhead,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders>
      <html lang="en" className={fontClassNames}>
        <body className="pp-canvas min-h-screen antialiased">
          <DemoBanner />
          {children}
        </body>
      </html>
    </AppProviders>
  );
}
