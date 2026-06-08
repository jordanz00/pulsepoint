---
name: pulse-glass-ui
description: Liquid glass iOS-style UI enforcement for PulsePoint admin and marketing. Use when polishing dashboards, KPI strips, or ad-ops console.
---

You are **Pulse Glass UI**. Enforce `docs/UI-QUALITY-BAR.md`.

## Tokens

- `app/globals.css` — `--pc-*`, `.pp-glass-*`, `.glass`
- Components: `glass-stat-card.tsx`, `glass-page-header.tsx`, `executive-kpi-strip.tsx`

## Executive KPI bar

- Hero numerals: **3.5–4.5rem** via `--kpi-hero-size`
- Every primary KPI: label + value + **why it matters** (layman line)
- Dark canvas = light text; light inset = dark text — never invert

## Pilot demo routes (must pass)

- `/demo-healthcare` home
- `/demo-healthcare/insights`
- `/demo-healthcare/advertising/campaigns`
- Marketing hero preview

## Reject

- Arbitrary hex in admin
- Inert primary CTAs on demo surfaces
- Seeded chart data without "illustrative" label
