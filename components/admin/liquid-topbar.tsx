"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CommandPalette } from "@/components/command-palette";
import type { AdminNavItem } from "@/lib/nav-config";
import { registerKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

type ExceptionPreview = {
  id: string;
  message: string;
  createdAt: string;
};

function ClerkChrome() {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { OrganizationSwitcher, UserButton } =
    require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  /* eslint-enable @typescript-eslint/no-require-imports */
  return (
    <>
      <OrganizationSwitcher hidePersonal />
      <UserButton />
    </>
  );
}

export function LiquidTopbar({
  orgSlug,
  orgName,
  nav,
  standalone,
  exceptionPreview = [],
}: {
  orgSlug: string;
  orgName?: string;
  nav: AdminNavItem[];
  standalone?: boolean;
  exceptionPreview?: ExceptionPreview[];
}) {
  const isStandalone = standalone ?? isStandalonePrototype();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const exceptionCount = exceptionPreview.length;
  const base = `/${orgSlug}`;

  useEffect(() => {
    const openPalette = () => setPaletteOpen(true);
    window.addEventListener("pp-open-command-palette", openPalette);
    return () => window.removeEventListener("pp-open-command-palette", openPalette);
  }, []);

  useEffect(() => {
    return registerKeyboardShortcuts([
      { key: "k", meta: true, handler: () => setPaletteOpen(true) },
      { key: "k", ctrl: true, handler: () => setPaletteOpen(true) },
      {
        key: "n",
        meta: true,
        handler: () => {
          window.location.href = `${base}/members/new`;
        },
      },
      {
        key: "e",
        meta: true,
        shift: true,
        handler: () => {
          window.location.href = `${base}/events/new`;
        },
      },
      {
        key: "i",
        meta: true,
        shift: true,
        handler: () => {
          window.location.href = `${base}/intelligence`;
        },
      },
      {
        key: "c",
        meta: true,
        shift: true,
        handler: () => {
          window.location.href = `${base}/command-center`;
        },
      },
    ]);
  }, [base]);

  return (
    <>
      <header className="pp-liquid-topbar glass">
        <div className="pp-liquid-topbar-inner">
          <Link href={base} className="pp-liquid-topbar-brand">
            <BrandLogo size="sm" />
            <span className="pp-liquid-topbar-title">PulsePoint</span>
            {orgName ? (
              <span className="pp-liquid-topbar-org hidden sm:inline" title={orgName}>
                {orgName}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="pp-global-search glass"
            aria-label="Open global search (Command K)"
            onClick={() => setPaletteOpen(true)}
          >
            <Search size={16} className="pp-global-search__icon" aria-hidden />
            <span className="pp-global-search__placeholder">
              Search members, pages, actions…
            </span>
            <kbd className="pp-liquid-search-kbd">⌘K</kbd>
          </button>

          <div className="pp-liquid-topbar-actions">
            <div className="pp-liquid-notif-wrap">
              <button
                type="button"
                className="pp-liquid-icon-btn"
                aria-label={`Notifications${exceptionCount ? `, ${exceptionCount} open` : ""}`}
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
              >
                <Bell size={18} aria-hidden />
                {exceptionCount > 0 ? (
                  <span className="pp-liquid-notif-badge">
                    {exceptionCount > 9 ? "9+" : exceptionCount}
                  </span>
                ) : null}
              </button>
              {notifOpen ? (
                <div className="pp-liquid-notif-panel glass glass-md">
                  <p className="pp-liquid-notif-title">Open exceptions</p>
                  {exceptionPreview.length === 0 ? (
                    <p className="pp-liquid-notif-empty">No open exceptions</p>
                  ) : (
                    <ul>
                      {exceptionPreview.map((ex) => (
                        <li key={ex.id} className="pp-liquid-notif-item">
                          {ex.message.slice(0, 120)}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`${base}/exceptions`}
                    className="pp-liquid-notif-link ds-btn ds-btn--ghost"
                    onClick={() => setNotifOpen(false)}
                  >
                    View all
                  </Link>
                </div>
              ) : null}
            </div>

            {isStandalone ? (
              <span
                className="pp-liquid-avatar pp-brand-mark pp-brand-mark--avatar"
                title={orgName ?? "Demo"}
                aria-label={orgName ?? "Demo user"}
              >
                PP
              </span>
            ) : (
              <ClerkChrome />
            )}
          </div>
        </div>
      </header>

      <CommandPalette
        orgSlug={orgSlug}
        nav={nav}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}
