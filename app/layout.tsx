import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { HERO_COPY } from "@/lib/marketing-content";
import { ORIGIN_STORY } from "@/lib/brand";
import { DemoBanner } from "@/components/demo-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen font-sans antialiased">
          <DemoBanner />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
