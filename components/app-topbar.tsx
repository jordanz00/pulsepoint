"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, HelpCircle, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CommandPalette } from "@/components/command-palette";
import { buildAdminNav } from "@/lib/nav-config";
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

export function AppTopbar({
  orgSlug,
  orgName,
  exceptionCount,
  exceptionPreview,
}: {
  orgSlug: string;
  orgName: string;
  exceptionCount: number;
  exceptionPreview: ExceptionPreview[];
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const standalone = isStandalonePrototype();

  useEffect(() => {
    return registerKeyboardShortcuts([
      { key: "k", meta: true, handler: () => setPaletteOpen(true) },
      { key: "k", ctrl: true, handler: () => setPaletteOpen(true) },
    ]);
  }, []);

  return (
    <>
      <header className="pp-topbar glass">
        <Link href={`/${orgSlug}`} className="pp-topbar-brand">
          <BrandLogo size="sm" />
          <span className="pp-topbar-title">PulsePoint</span>
          <span className="pp-topbar-ams">AMS</span>
        </Link>

        <div className="pp-topbar-spacer" aria-hidden />

        <button
          type="button"
          className="pp-topbar-search glass"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open command palette"
        >
          <Search size={14} aria-hidden />
          <span>Search members, events, orders…</span>
          <kbd>⌘K</kbd>
        </button>

        <Link
          href="/docs"
          className="btn btn-ghost btn-icon"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle size={18} aria-hidden />
        </Link>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label={`Notifications${exceptionCount ? `, ${exceptionCount} open` : ""}`}
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={18} aria-hidden />
            {exceptionCount > 0 ? (
              <span
                className="nav-badge-count nav-badge-count--danger"
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  padding: "0 4px",
                }}
              >
                {exceptionCount > 9 ? "9+" : exceptionCount}
              </span>
            ) : null}
          </button>
          {notifOpen ? (
            <div
              className="glass glass-md"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 320,
                borderRadius: "var(--r-lg)",
                padding: 8,
                zIndex: 80,
              }}
            >
              <p className="card-title" style={{ padding: "8px 10px" }}>
                Open exceptions
              </p>
              {exceptionPreview.length === 0 ? (
                <p className="page-subtitle" style={{ padding: "8px 10px" }}>
                  No open exceptions
                </p>
              ) : (
                <ul>
                  {exceptionPreview.map((ex) => (
                    <li key={ex.id} style={{ padding: "8px 10px", fontSize: "12px" }}>
                      {ex.message.slice(0, 120)}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/${orgSlug}/exceptions`}
                className="btn btn-secondary btn-sm"
                style={{ margin: "8px 10px", display: "inline-flex" }}
                onClick={() => setNotifOpen(false)}
              >
                View all
              </Link>
            </div>
          ) : null}
        </div>

        {standalone ? (
          <span className="pp-sidebar-org-mark" title={orgName} aria-label={orgName}>
            PP
          </span>
        ) : (
          <ClerkChrome />
        )}
      </header>

      <CommandPalette
        orgSlug={orgSlug}
        nav={buildAdminNav(orgSlug)}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}
