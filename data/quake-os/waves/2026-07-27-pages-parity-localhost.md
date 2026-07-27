# Wave 2026-07-27 — GitHub Pages parity with localhost marketing

## Scope

Make https://jordanz00.github.io/pulsepoint/ match http://localhost:3000/ marketing homepage (not the old hand HTML).

## Files

- `scripts/gh-pages-build.sh` — marketing-only static export
- `next.config.ts` — `output: 'export'` + `basePath: /pulsepoint` when `GITHUB_PAGES=true`
- `.github/workflows/github-pages.yml` — build `out/` from Next
- Marketing pages static (no cookies); `DemoBanner` / demo CTA GH Pages gates
- `docs/GITHUB-PAGES.md` updated

## Verify

- [x] `pnpm build:gh-pages` → `out/index.html` contains Why PulsePoint / Five reasons / `/pulsepoint/_next`
- [ ] Deploy workflow + browser compare localhost vs Pages at 1280

## Gaps

- Full AMS demo still local-only (`/demo` stub on Pages)
- `gh-pages-site/` legacy folder retained but unused by CI
