# Wave 2026-07-27 — Static GitHub Pages runnable demo

## Scope

Make GitHub Pages **run** the demo (enter → admin shell → modules), not a “run locally” stub.

## Files

- `lib/static-demo/session.ts`, `seed.ts`
- `components/static-demo/*` — launcher, shell, chrome
- `app/demo/page.tsx` — client enter (sessionStorage on Pages; API forms locally)
- `app/demo-healthcare/**` — static admin routes + catch-all
- `scripts/gh-pages-build.sh` — exports demo tree
- `docs/GITHUB-PAGES.md`

## Verify

- [x] `pnpm build:gh-pages` exports `out/demo/` + `out/demo-healthcare/`
- [ ] Deploy + browser: enter demo → members/events/suite/walkthrough work on Pages

## Gaps

- Mutations / Stripe / imports still localhost-only (static hosting constraint)
- Illustrative seed — honest Demo preview labels
