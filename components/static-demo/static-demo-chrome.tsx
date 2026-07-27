"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { SkipToMain } from "@/components/skip-to-main";
import { buildAdminNav } from "@/lib/nav-config";
import {
  STATIC_DEMO_EXCEPTIONS,
  STATIC_DEMO_NAV_COUNTS,
  STATIC_DEMO_ORG,
} from "@/lib/static-demo/seed";
import { exitStaticDemo } from "@/lib/static-demo/session";
import { useRouter } from "next/navigation";

const PRIMARY_IDS = new Set([
  "work",
  "suite",
  "members",
  "events",
  "insights",
  "command-center",
  "giving",
  "engage",
  "learn",
  "commerce",
  "crm",
  "exceptions",
]);

/**
 * Self-contained admin chrome for GitHub Pages — no server actions / command palette.
 */
export function StaticDemoChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const orgSlug = STATIC_DEMO_ORG.slug;
  const nav = useMemo(
    () => buildAdminNav(orgSlug).filter((item) => PRIMARY_IDS.has(item.id)),
    [orgSlug],
  );

  function onExit() {
    exitStaticDemo();
    router.push("/demo/");
  }

  return (
    <div className="pp-liquid-shell pp-canvas ds-app">
      <SkipToMain />
      <div className="pc-demo-banner">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4">
          <p className="text-sm text-[var(--pc-text)]">
            <strong>Demo mode</strong>
            <span className="mx-2 text-[var(--pc-text-tertiary)]">·</span>
            Illustrative sample · runs in your browser on GitHub Pages
          </p>
          <button
            type="button"
            className="pc-btn-secondary !min-h-9 !px-3 !py-1.5 !text-sm"
            onClick={onExit}
          >
            Exit demo
          </button>
        </div>
      </div>

      <header className="pp-liquid-topbar glass">
        <div className="pp-liquid-topbar-inner">
          <Link href={`/${orgSlug}/`} className="pp-liquid-topbar-brand">
            <BrandLogo size="sm" />
            <span className="pp-liquid-topbar-title">PulsePoint</span>
            <span className="pp-liquid-topbar-org hidden sm:inline">{STATIC_DEMO_ORG.name}</span>
          </Link>
          <div className="pp-liquid-topbar-actions">
            <span className="pp-sidebar-org-mark" title="Demo owner" aria-label="Demo owner">
              PP
            </span>
          </div>
        </div>
      </header>

      <div className="pp-liquid-body">
        <aside className="pp-liquid-sidebar glass" aria-label="Demo navigation">
          <p className="px-4 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--pc-text-tertiary)]">
            Modules
          </p>
          <nav className="mt-2 space-y-0.5 px-2 pb-6">
            {nav.map((item) => {
              const href = item.href.endsWith("/") ? item.href : `${item.href}/`;
              const active =
                pathname === item.href ||
                pathname === href ||
                (item.href !== `/${orgSlug}` &&
                  item.href !== `/${orgSlug}/` &&
                  pathname.startsWith(item.href));
              const count =
                item.id === "members"
                  ? STATIC_DEMO_NAV_COUNTS.members
                  : item.id === "events"
                    ? STATIC_DEMO_NAV_COUNTS.events
                    : item.id === "exceptions"
                      ? STATIC_DEMO_NAV_COUNTS.exceptions
                      : null;
              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-[var(--pc-accent-soft)] font-semibold text-[var(--pc-text)]"
                      : "text-[var(--pc-text-secondary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span>{item.name}</span>
                  {count != null ? (
                    <span className="tabular-nums text-xs text-[var(--pc-text-tertiary)]">{count}</span>
                  ) : null}
                </Link>
              );
            })}
            <Link
              href={`/${orgSlug}/walkthrough/?step=0`}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                pathname.includes("/walkthrough")
                  ? "bg-[var(--pc-accent-soft)] font-semibold text-[var(--pc-text)]"
                  : "text-[var(--pc-text-secondary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Guided tour
            </Link>
          </nav>
          {STATIC_DEMO_EXCEPTIONS.length > 0 ? (
            <p className="border-t border-[var(--pc-border)] px-4 py-3 text-xs text-[var(--pc-text-tertiary)]">
              {STATIC_DEMO_EXCEPTIONS.length} open exceptions (illustrative)
            </p>
          ) : null}
        </aside>
        <main id="main-content" className="pp-liquid-main">
          {children}
        </main>
      </div>
    </div>
  );
}
