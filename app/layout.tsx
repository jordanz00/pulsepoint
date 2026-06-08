import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import { MARKETING_HERO } from "@/lib/marketing-home";
import { DemoBanner } from "@/components/demo-banner";
import { fontClassNames } from "@/components/pulse-fonts";
import "./globals.css";
import "./pulse-surfaces.css";
import "./admin-surfaces.css";
import "./design-system.css";
import "./liquid-glass-overhaul.css";
import "./why-pulsepoint-flagship.css";

export const metadata: Metadata = {
  title: `PulsePoint — ${MARKETING_HERO.headline}`,
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
