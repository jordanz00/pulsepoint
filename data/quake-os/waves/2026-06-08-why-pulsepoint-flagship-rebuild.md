# Wave: Why PulsePoint flagship rebuild

**Date:** 2026-06-08  
**Scope:** Marketing landing `#why-pulsepoint` — full cinematic rebuild  
**Risk:** Medium (new CSS file + client components; no data layer changes)

## Problem

Prior passes stacked bento cards, sparklines, and ring charts. User bar: keynote / portfolio grade with real interaction—not incremental polish.

## Shipped

| Asset | Role |
|-------|------|
| `app/why-pulsepoint-flagship.css` | Full-bleed dark stage, metrics, scrubber, module film |
| `components/marketing/vs-legacy-premium.tsx` | Orchestrates Act I–II + footer |
| `components/marketing/why-pulsepoint-compare-scrubber.tsx` | Drag compare: legacy chaos vs PulsePoint unified |
| `components/marketing/why-pulsepoint-module-film.tsx` | Module rail + live UI frame previews |
| `lib/why-pulsepoint-flagship.ts` | Compare mock panel data (illustrative) |
| `.cursor/rules/flagship-delivery-workflow.mdc` | Browser-verify-before-done workflow |

## Interactions

- **Compare scrubber:** pointer drag + arrow keys; 4 dimension tabs sync story
- **Module film:** auto-rotate modules; pause on hover/focus; per-module mini UI chrome

## Verify

- [x] `pnpm ship:now` / claims:validate
- [x] Component wired in `vs-legacy-premium.tsx` + `app/layout.tsx`
- [ ] Browser: `/` → `#why-pulsepoint` at 375 / 1280 / 1440 (human spot-check)

## Honest scope

Numbers remain illustrative sample data with on-page disclaimer. Not a 3D WebGL pass—interaction-first flagship within static Next marketing constraints.
