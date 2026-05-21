# PulsePoint

**The modern AMS built for healthcare associations.**

*Built by an association that got tired of paying millions for outdated software.*

PulsePoint is a multi-tenant AMS for healthcare associations, delivered as a product suite:

| Product | Status |
|---------|--------|
| **PulsePoint Work** | Available — staff admin workspace (MemberCore + Events modules live) |
| **MemberCore** | Available — Membership Management: CRM, tags, CSV import/export |
| **PulsePoint Events** | Available — registration, payments, check-in |
| **PulsePoint Commerce** | Coming soon — e-commerce, storefronts, and association payments |
| **PulsePoint AI** | Coming soon — staff assist and comms drafts |
| **PulsePoint Insights** | Coming soon — dashboards and board reports |

**Engineering (anti–vibe-code):** [docs/SECURITY-PARANOID.md](docs/SECURITY-PARANOID.md) · [docs/VIBE-CODE-RISKS.md](docs/VIBE-CODE-RISKS.md) · [docs/SYSTEM-DESIGN.md](docs/SYSTEM-DESIGN.md) · [docs/DATA-DICTIONARY.md](docs/DATA-DICTIONARY.md) · [docs/OPERATOR-CHECKLIST.md](docs/OPERATOR-CHECKLIST.md) · [docs/RUNBOOK.md](docs/RUNBOOK.md) · [docs/AI-DATA-POLICY.md](docs/AI-DATA-POLICY.md)

After code changes: `pnpm test` · `pnpm security:audit`

**Feature pillars** (operational): Members, Events, Commerce, Committees, Communications, Insights, AI Tools — see [docs/POSITIONING.md](docs/POSITIONING.md).

| | |
|---|---|
| **Brand** | PulsePoint |
| **Package / repo folder** | `pulsepoint` (`/Users/jordanzabady/Desktop/pulse`) |
| **Stack** | Next.js 16 · Postgres · Prisma · Clerk · Stripe · Resend |
| **MVP data** | PII only (no PHI) |

## Live demo on GitHub (no Vercel)

Static marketing + click-through admin preview — deployed from `gh-pages-site/` via GitHub Actions.

| Link | Purpose |
|------|---------|
| [Landing](https://jordanz00.github.io/pulsepoint/) | Marketing homepage |
| [Enter demo](https://jordanz00.github.io/pulsepoint/demo/) | One-click demo (browser session) |
| [Admin preview](https://jordanz00.github.io/pulsepoint/demo-healthcare/) | Sterling Healthcare sample dashboard |

**Setup:** Repo **Settings → Pages → Source: GitHub Actions**. Public repo required for free Pages on private accounts. See [docs/GITHUB-PAGES.md](docs/GITHUB-PAGES.md).

For the **full** database-backed app (imports, Stripe, SQLite): local quick start below.

## Quick start (local)

### 1. Prerequisites

- Node 22+
- pnpm 9+
- Docker (optional, for local Postgres)

### 2. Install

```bash
cd /Users/jordanzabady/Desktop/pulse
cp .env.local.example .env.local
# Fill Clerk keys at minimum for auth; DATABASE_URL works with Docker below

pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Clerk setup

1. Create an application at [clerk.com](https://clerk.com).
2. Enable **Organizations**.
3. Add keys to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Webhook endpoint: `https://<your-host>/api/webhooks/clerk`  
   Events: `user.*`, `organization.*`, `organizationMembership.*`  
   Signing secret → `CLERK_WEBHOOK_SECRET`

### 4. Stripe / Resend (optional for v0.1)

- **Stripe:** paid event checkout + `STRIPE_WEBHOOK_SECRET` on `/api/webhooks/stripe`
- **Resend:** confirmation emails after registration

See [docs/DEPLOY.md](docs/DEPLOY.md) for Vercel + Neon production steps.

## Project layout

```
app/
  (marketing)/          Landing page
  [orgSlug]/(admin)/    Staff dashboard (members, events, settings, portal)
  [orgSlug]/e/          Public event registration (no auth)
  api/webhooks/         Clerk + Stripe
lib/                    db, auth, audit, stripe, email, rate-limit
prisma/                 Schema + migrations
tests/                  Vitest + Playwright
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests |
| `pnpm db:migrate` | Apply migrations (dev) |
| `pnpm db:seed` | Demo org seed |

## Trademark

See [docs/TRADEMARK.md](docs/TRADEMARK.md). **PulsePoint** is used instead of plain “Pulse” to reduce collision with existing healthcare and CRM marks.

## Roadmap (plan)

- **Phase 0** — Scaffold (this repo)
- **Phase 1** — Member CRM polish
- **Phase 2** — Events + payments + email
- **Phase 3** — Member portal (Clerk-linked members)
- **Phase 4** — Platform billing, marketing site, beta

## Security

See [SECURITY.md](SECURITY.md).
