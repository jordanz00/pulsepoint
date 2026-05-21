import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { HERO_COPY } from "@/lib/marketing-content";
import { ORIGIN_STORY } from "@/lib/brand";
import { DemoBanner } from "@/components/demo-banner";
import "./globals.css";

/** HAP display font (April 2025 guidelines); body stays Tahoma in globals.css */
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: `PulsePoint — ${HERO_COPY.headline}`,
  description: `${HERO_COPY.lead} ${ORIGIN_STORY}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders>
      <html lang="en" className={montserrat.variable}>
        <body className="min-h-screen font-sans antialiased">
          <DemoBanner />
          {children}
        </body>
      </html>
    </AppProviders>
  );
}
