# GitHub Pages and PulsePoint

## Live site (matches localhost marketing + runnable demo)

| URL | What you get |
| --- | --- |
| **https://jordanz00.github.io/pulsepoint/** | Same marketing homepage as `localhost:3000` |
| **https://jordanz00.github.io/pulsepoint/demo/** | Enter demo (guided / suite / overview) |
| **https://jordanz00.github.io/pulsepoint/demo-healthcare/** | Interactive admin chrome + module previews |

**How the demo runs on static Pages:** `sessionStorage` gate (no cookies/API). Module UIs reuse the same marketing preview components as localhost. Data is **illustrative** — labeled Demo preview.

**Enable once:** GitHub → **Settings** → **Pages** → Build source: **GitHub Actions**.

### Build locally

```bash
pnpm build:gh-pages
# out/index.html + out/demo/ + out/demo-healthcare/
```

CI: `.github/workflows/github-pages.yml`

### Honest scope

| On GitHub Pages | Localhost only (`pnpm demo:setup && pnpm dev`) |
| --- | --- |
| Marketing homepage (identical) | Same |
| Enter demo → admin shell | Cookie + SQLite demo |
| Members / events / insights / suite / walkthrough (interactive) | Full Prisma CRUD, Stripe, imports |
| Catch-all module routes (previews) | Full `[orgSlug]` admin tree |
