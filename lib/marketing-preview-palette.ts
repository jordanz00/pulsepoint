/**
 * Non-overlapping module color slots per marketing preview surface.
 * Validates that simultaneous elements on each tab share no ProductId.
 */

import { assertUniqueModuleColors } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";
import { HERO_PREVIEW_TILES } from "@/lib/marketing-home";

/** Hero · Overview tab — KPIs + mix + chart (tiles are on Modules tab only). */
export const HERO_OVERVIEW_MODULE_COLORS = {
  kpis: ["members", "insights", "commerce", "events", "deals"] as ProductId[],
  mix: ["work", "crm", "advertising"] as ProductId[],
  chart: "learn" as ProductId,
} as const;

/** Hero · Modules tab — all 12 suite products, one tile each (see HERO_PREVIEW_TILES). */
export const HERO_MODULES_TAB_EXPECTED = 12;

/** MemberCore · Directory panel — unique module accents (chips/rows use neutral glass). */
export const MEMBERCORE_PREVIEW_MODULE_COLORS = {
  chrome: "members" as ProductId,
  search: "crm" as ProductId,
  kpis: ["insights", "work", "commerce", "engage"] as ProductId[],
  mix: ["deals", "advertising", "giving"] as ProductId[],
  facilities: ["events", "learn"] as ProductId[],
} as const;

/** Advocacy · preview — validate per visible region (not one flat list) */
export const ADVOCACY_PREVIEW_MODULE_COLORS = {
  chrome: "advocacy" as ProductId,
  kpis: ["work", "members", "engage", "crm"] as ProductId[],
  agendaPanel: {
    shell: "advocacy" as ProductId,
    segments: ["members", "insights", "crm"] as ProductId[],
  },
  campaignsPanel: {
    shell: "engage" as ProductId,
    rows: ["deals", "advertising", "learn"] as ProductId[],
  },
  /** Only one issue row highlighted at a time; palette covers active accents */
  issues: ["advocacy", "insights", "events"] as ProductId[],
} as const;

function validatePalettes(): void {
  assertUniqueModuleColors(
    [
      ...HERO_OVERVIEW_MODULE_COLORS.kpis,
      ...HERO_OVERVIEW_MODULE_COLORS.mix,
      HERO_OVERVIEW_MODULE_COLORS.chart,
    ],
    "hero overview",
  );
  assertUniqueModuleColors(
    [
      MEMBERCORE_PREVIEW_MODULE_COLORS.chrome,
      MEMBERCORE_PREVIEW_MODULE_COLORS.search,
      ...MEMBERCORE_PREVIEW_MODULE_COLORS.kpis,
      ...MEMBERCORE_PREVIEW_MODULE_COLORS.mix,
      ...MEMBERCORE_PREVIEW_MODULE_COLORS.facilities,
    ],
    "membercore preview",
  );
  assertUniqueModuleColors(
    [ADVOCACY_PREVIEW_MODULE_COLORS.chrome, ...ADVOCACY_PREVIEW_MODULE_COLORS.kpis],
    "advocacy preview header",
  );
  assertUniqueModuleColors(
    ADVOCACY_PREVIEW_MODULE_COLORS.agendaPanel.segments,
    "advocacy preview agenda",
  );
  assertUniqueModuleColors(
    ADVOCACY_PREVIEW_MODULE_COLORS.campaignsPanel.rows,
    "advocacy preview campaigns",
  );
  assertUniqueModuleColors(
    [
      ADVOCACY_PREVIEW_MODULE_COLORS.agendaPanel.shell,
      ADVOCACY_PREVIEW_MODULE_COLORS.campaignsPanel.shell,
      ...ADVOCACY_PREVIEW_MODULE_COLORS.agendaPanel.segments,
      ...ADVOCACY_PREVIEW_MODULE_COLORS.campaignsPanel.rows,
    ],
    "advocacy preview analytics deck",
  );
  assertUniqueModuleColors(ADVOCACY_PREVIEW_MODULE_COLORS.issues, "advocacy preview issues");
  if (HERO_PREVIEW_TILES.length !== HERO_MODULES_TAB_EXPECTED) {
    throw new Error(
      `HERO_PREVIEW_TILES length ${HERO_PREVIEW_TILES.length} !== HERO_MODULES_TAB_EXPECTED ${HERO_MODULES_TAB_EXPECTED}`,
    );
  }
}

if (process.env.NODE_ENV !== "production") {
  validatePalettes();
}
