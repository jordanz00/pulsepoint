/**
 * Canonical module colors — one unique identity per PulsePoint product.
 * Module accent colors — distinct hue families; card washes differ per module.
 * CSS variables in globals.css must stay in sync.
 */

import { PULSE_BRAND } from "@/lib/brand-colors";
import type { ProductId } from "@/lib/products";

export type ModuleColorTokens = {
  fg: string;
  tint: string;
  border: string;
  cardFrom: string;
  cardTo: string;
};

export const MODULE_COLOR_ORDER: ProductId[] = [
  "work",
  "members",
  "crm",
  "deals",
  "events",
  "advertising",
  "learn",
  "giving",
  "commerce",
  "engage",
  "insights",
  "advocacy",
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mod(fg: string, cardRgb: [number, number, number]): ModuleColorTokens {
  const [r, g, b] = hexToRgb(fg);
  const [cr, cg, cb] = cardRgb;
  return {
    fg,
    tint: `rgba(${r}, ${g}, ${b}, 0.16)`,
    border: `rgba(${r}, ${g}, ${b}, 0.34)`,
    cardFrom: `rgba(${cr}, ${cg}, ${cb}, 0.94)`,
    cardTo: "rgba(255, 255, 255, 0.68)",
  };
}

/**
 * Twelve module hues — spaced across the wheel so adjacent modules never share a family.
 * Pink ≠ red · violet ≠ navy · green ≠ yellow ≠ teal · no duplicate purples.
 */
export const MODULE_COLORS: Record<ProductId, ModuleColorTokens> = {
  work: mod("#64748B", [226, 232, 240]),
  members: mod("#15803D", [204, 236, 210]),
  crm: mod("#0078D4", [198, 224, 252]),
  deals: mod("#EC4899", [255, 220, 238]),
  events: mod("#EA580C", [255, 228, 200]),
  advertising: mod("#6D28D9", [232, 210, 255]),
  learn: mod("#EAB308", [255, 248, 190]),
  giving: mod("#991B1B", [255, 205, 205]),
  commerce: mod("#0F766E", [180, 238, 228]),
  engage: mod("#06B6D4", [200, 248, 255]),
  insights: mod("#1E40AF", [200, 214, 255]),
  advocacy: mod("#92400E", [255, 236, 200]),
};

/** Brand primary kept for shell chrome — not reused as a module fg. */
export const MODULE_BRAND_PRIMARY = PULSE_BRAND.primary;

export function moduleCssVars(id: ProductId): Record<string, string> {
  const c = MODULE_COLORS[id];
  return {
    "--mod-active-fg": c.fg,
    "--mod-active-tint": c.tint,
    "--mod-active-border": c.border,
    "--mod-active-from": c.cardFrom,
    "--mod-active-to": c.cardTo,
  };
}

export function assertUniqueModuleColors(ids: ProductId[], surfaceLabel: string): void {
  const seen = new Set<ProductId>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`Duplicate module color on ${surfaceLabel}: "${id}"`);
    }
    seen.add(id);
  }
}

export function assertUniqueModuleFgColors(): void {
  const seen = new Map<string, ProductId>();
  for (const id of MODULE_COLOR_ORDER) {
    const fg = MODULE_COLORS[id].fg.toLowerCase();
    const prior = seen.get(fg);
    if (prior) {
      throw new Error(`Duplicate module fg "${fg}" on ${prior} and ${id}`);
    }
    seen.set(fg, id);
  }
}
