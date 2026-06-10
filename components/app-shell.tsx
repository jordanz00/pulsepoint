"use client";

import { LiquidSidebar } from "@/components/admin/liquid-sidebar";
import { LiquidMobileNav } from "@/components/admin/liquid-mobile-nav";
import { LiquidTopbar } from "@/components/admin/liquid-topbar";
import { EnterpriseOperationalRail } from "@/components/enterprise/enterprise-operational-rail";
import { NavPreferencesProvider } from "@/components/navigation/nav-preferences-provider";
import { RecentTracker } from "@/components/navigation/recent-tracker";
import { SkipToMain } from "@/components/skip-to-main";
import type { AdminNavCounts } from "@/lib/admin-nav-counts";
import type { AdminNavItem } from "@/lib/nav-config";

export function AppShell({
  orgSlug,
  orgName,
  nav,
  navCounts,
  standalone = false,
  exceptionPreview = [],
  children,
}: {
  orgSlug: string;
  orgName: string;
  orgLogoUrl?: string | null;
  nav: AdminNavItem[];
  navCounts: AdminNavCounts;
  standalone?: boolean;
  exceptionPreview?: Array<{ id: string; message: string; createdAt: string }>;
  children: React.ReactNode;
}) {
  return (
    <NavPreferencesProvider orgSlug={orgSlug}>
      <RecentTracker orgSlug={orgSlug} nav={nav} />
      <div className="pp-liquid-shell pp-canvas ds-app">
        <SkipToMain />
        <LiquidTopbar
          orgSlug={orgSlug}
          orgName={orgName}
          nav={nav}
          standalone={standalone}
          exceptionPreview={exceptionPreview}
        />
        <EnterpriseOperationalRail
          orgSlug={orgSlug}
          exceptionCount={navCounts.exceptions}
        />
        <div className="pp-liquid-body">
          <LiquidSidebar
            orgSlug={orgSlug}
            orgName={orgName}
            nav={nav}
            counts={navCounts}
          />
          <main id="main-content" className="pp-liquid-main">
            {children}
          </main>
        </div>
        <LiquidMobileNav orgSlug={orgSlug} nav={nav} />
      </div>
    </NavPreferencesProvider>
  );
}
