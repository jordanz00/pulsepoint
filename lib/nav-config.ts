/**
 * Admin navigation — grouped sidebar for PulsePoint prototype.
 */

import { PULSE_PRODUCTS, productHref, type PulseProduct } from "@/lib/products";

export type NavItemStatus = "live" | "roadmap" | "system";

export type AdminNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  status: NavItemStatus;
  group: "home" | "products" | "system";
  productId?: PulseProduct["id"];
};

export function buildAdminNav(orgSlug: string): AdminNavItem[] {
  const home: AdminNavItem[] = [
    {
      href: `/${orgSlug}`,
      label: "Overview",
      shortLabel: "Overview",
      status: "system",
      group: "home",
    },
    {
      href: `/${orgSlug}/work`,
      label: "PulsePoint Work",
      shortLabel: "Work",
      status: "live",
      group: "home",
      productId: "work",
    },
  ];

  const products: AdminNavItem[] = PULSE_PRODUCTS.filter((p) => p.id !== "work").map(
    (p) => ({
      href: productHref(orgSlug, p),
      label: p.name,
      shortLabel: p.shortName,
      status: p.status === "available" ? "live" : "roadmap",
      group: "products" as const,
      productId: p.id,
    }),
  );

  const system: AdminNavItem[] = [
    {
      href: `/${orgSlug}/members/imports`,
      label: "Import review",
      shortLabel: "Imports",
      status: "live",
      group: "system",
    },
    {
      href: `/${orgSlug}/portal`,
      label: "Member portal preview",
      shortLabel: "Portal",
      status: "live",
      group: "system",
    },
    {
      href: `/${orgSlug}/exceptions`,
      label: "Exception queue",
      shortLabel: "Exceptions",
      status: "live",
      group: "system",
    },
    {
      href: `/${orgSlug}/settings`,
      label: "Settings",
      shortLabel: "Settings",
      status: "system",
      group: "system",
    },
  ];

  return [...home, ...products, ...system];
}
