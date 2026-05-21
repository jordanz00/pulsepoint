# GitHub Pages and PulsePoint

## The short answer

**GitHub Pages hosts static files only** (HTML, CSS, JS). It does not run Node.js, Postgres, or Next.js server features.

| PulsePoint feature | Works on GitHub Pages? |
| --- | --- |
| Marketing homepage (static) | Partially — only with `output: 'export'` and no server-only code |
| `/demo` one-click sign-in | **No** — needs `POST /api/demo/enter` |
| Admin (`/demo-healthcare`, members, events) | **No** — Server Components + Prisma + auth |
| Clerk sign-in | **No** — server middleware + secrets |
| Stripe / webhooks | **No** |

**For the full clickable prototype**, deploy to **Vercel** (or similar). See [Deploy on Vercel](#recommended-full-prototype-vercel) below.

**For a read-only marketing preview** on GitHub Pages, see [Static export (limited)](#option-a-static-export-limited-github-pages).

---

## Your repo URL shape

Repo: `jordanz00/pulsepoint` (project site, not `username.github.io`)

Published site would be:

**https://jordanz00.github.io/pulsepoint/**

That requires `basePath` and `assetPrefix` of `/pulsepoint` in Next.js config.

---

## Option A: Static export (limited GitHub Pages)

Use this only if you accept a **marketing-only** snapshot with no demo, no admin, no database.

### 1. Next.js config (export mode)

In `next.config.ts`, gate export behind an env flag so local dev stays normal:

```ts
import type { NextConfig } from "next";

const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGhPages ? "export" : undefined,
  basePath: isGhPages ? "/pulsepoint" : "",
  assetPrefix: isGhPages ? "/pulsepoint/" : "",
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
```

### 2. Build script

In `package.json`:

```json
"build:gh-pages": "GITHUB_PAGES=true prisma generate && next build"
```

`next build` with `output: 'export'` writes static files to `out/`.

### 3. Pages that must be excluded or rewritten

Static export **fails** if a page uses (non-exhaustive):

- `auth()` from Clerk on the server
- `prisma.*` in Server Components
- Dynamic routes without `generateStaticParams`
- API routes under `app/api/`

Today PulsePoint uses all of the above on admin and demo paths. You would need a **separate** minimal marketing build (or a branch that strips server code) — not a one-line toggle on the full app.

### 4. GitHub Actions workflow

Create `.github/workflows/github-pages.yml`:

```yaml
name: Deploy static site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      # Only works after marketing-only export build succeeds:
      - run: pnpm build:gh-pages
        env:
          GITHUB_PAGES: "true"
          # No DATABASE_URL needed if build has zero prisma imports in traced pages

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 5. Enable Pages in the repo

1. GitHub → **jordanz00/pulsepoint** → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. After a successful workflow run, open **https://jordanz00.github.io/pulsepoint/**

### 6. Private repo note

Pages on a **private** repo requires a GitHub plan that includes Pages for private repositories (GitHub Free includes Pages for **public** repos only). Your repo is **private** — either make the repo public for free Pages, use a paid plan, or deploy elsewhere.

---

## Recommended: full prototype (Vercel)

This matches how Next.js is meant to run: server, API routes, env vars, Postgres (Neon), demo mode.

### Steps

1. Push code (already at https://github.com/jordanz00/pulsepoint).
2. https://vercel.com → **Add New Project** → Import `pulsepoint`.
3. Set environment variables (from `.env.local.example`):
   - `DATABASE_URL` (Neon or other hosted Postgres)
   - `DEMO_MODE=true` on **Preview** only (never Production)
   - `DEMO_SESSION_SECRET` (32+ chars)
   - Clerk / Stripe keys if you use those flows
4. Deploy. Vercel gives URLs like:
   - `https://pulsepoint-xxx.vercel.app`
   - Demo: `https://pulsepoint-xxx.vercel.app/demo`

### Link Vercel in the GitHub README

Add to `README.md`:

```md
**Live prototype (preview):** https://your-project.vercel.app/demo
```

That is the URL you share with leadership — not the GitHub repo tree URL.

---

## Option B: GitHub Pages for docs only

If the goal is “something on github.io” without fighting Next.js:

- Publish **`docs/`** as a Jekyll/static site (Settings → Pages → Deploy from branch `main` / folder `/docs`), **or**
- Keep the app on Vercel and use GitHub only for source + Issues/PRs.

---

## Comparison

| Host | Full prototype | Cost | Setup |
| --- | --- | --- | --- |
| GitHub Pages | No (static only) | Free (public repo) | Medium — export refactor |
| Vercel | Yes | Free tier | Low — import repo |
| Local `pnpm dev` | Yes | Free | Lowest — for you only |

---

## What we recommend for PulsePoint

1. **Leadership demo URL** → Vercel preview + `DEMO_MODE=true` → `/demo`
2. **Source of truth** → https://github.com/jordanz00/pulsepoint
3. **GitHub Pages** → skip for the full app; optional later for a static brochure page only

If you want, we can add a `marketing-export` sub-build or a `gh-pages` branch that deploys only the homepage — that is a separate, scoped task.
