# PulseCore

**PulseCore** is a multi-tenant association management platform for healthcare associations—starting with **Member CRM** and **Events**, built to reduce reliance on legacy AMS stacks (e.g. Protech on Microsoft Dynamics).

| | |
|---|---|
| **Brand** | PulseCore |
| **Package / repo folder** | `pulscore` (`/Users/jordanzabady/Desktop/pulse`) |
| **Stack** | Next.js 16 · Postgres · Prisma · Clerk · Stripe · Resend |
| **MVP data** | PII only (no PHI) |

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

See [docs/TRADEMARK.md](docs/TRADEMARK.md). **PulseCore** is used instead of plain “Pulse” to reduce collision with existing healthcare and CRM marks.

## Roadmap (plan)

- **Phase 0** — Scaffold (this repo)
- **Phase 1** — Member CRM polish
- **Phase 2** — Events + payments + email
- **Phase 3** — Member portal (Clerk-linked members)
- **Phase 4** — Platform billing, marketing site, beta

## Security

See [SECURITY.md](SECURITY.md).
