/**
 * Shared liquid-glass class names + CSS variables for marketing previews.
 * Always pair `mk-mod-glass-*` classes with `style={moduleCssVars(productId)}`.
 */

import type { CSSProperties } from "react";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

export function modGlassKpiProps(id: ProductId, active = false) {
  return {
    className: `mk-mod-glass-kpi${active ? " mk-mod-glass-kpi--active" : ""}`,
    style: moduleCssVars(id) as CSSProperties,
  };
}

export function modGlassTileProps(id: ProductId, active = false) {
  return {
    className: `mk-mod-glass-tile${active ? " mk-mod-glass-tile--active" : ""}`,
    style: moduleCssVars(id) as CSSProperties,
  };
}

export function modGlassPanelProps(id: ProductId) {
  return {
    className: "mk-mod-glass-panel",
    style: moduleCssVars(id) as CSSProperties,
  };
}

export function modMixSegmentProps(id: ProductId, widthPct: number) {
  return {
    className: "mk-mod-glass-mix-seg",
    style: { ...moduleCssVars(id), width: `${widthPct}%` } as CSSProperties,
  };
}
