# GitHub Pages and PulsePoint

## Live static demo (no Vercel)

The repo ships a **static** marketing + demo site in `gh-pages-site/`, deployed by `.github/workflows/github-pages.yml`.

| URL (public repo) | What you get |
| --- | --- |
| **https://jordanz00.github.io/pulsepoint/** | Marketing landing |
| **https://jordanz00.github.io/pulsepoint/demo/** | Enter demo (session storage) |
| **https://jordanz00.github.io/pulsepoint/demo-healthcare/** | Admin preview (illustrative data) |

**Enable once:** GitHub → **Settings** → **Pages** → Build source: **GitHub Actions**.

**Private repo:** GitHub Pages on private repos requires a paid plan; make the repo **public** for free Pages, or use local `pnpm dev` for the full app.

### Static vs full Next.js app

| Feature | GitHub Pages (`gh-pages-site`) | Local / Node host (`pnpm dev`) |
| --- | --- | --- |
| Marketing homepage | Yes | Yes |
| One-click demo | Yes (browser session) | Yes (signed cookie + SQLite) |
| Real DB, imports, Stripe | No | Yes |
| Clerk | No | Optional |

---

## Technical note (why two demos exist)

**GitHub Pages hosts static files only** — no Node.js, Postgres, or Next.js API routes.

| PulsePoint feature | Full Next.js app | Static `gh-pages-site` |
| --- | --- | --- |
| `/api/demo/enter` | Yes | N/A — `sessionStorage` instead |
| Prisma / admin CRUD | Yes | Preview tables only |
| Stripe / webhooks | Yes | No |

**For the database-backed prototype**, run locally: `pnpm demo:setup && pnpm dev` → http://localhost:3000/demo

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

1. **Share with supervisors (no install)** → GitHub Pages URLs above
2. **Hands-on engineering demo** → `pnpm demo:setup && pnpm dev` → `/demo`
3. **Production pilot** → Vercel or org host + Postgres (see [DEPLOY.md](./DEPLOY.md))
4. **Source of truth** → https://github.com/jordanz00/pulsepoint
