# PulsePoint prototype guide

**PulsePoint** is positioned as an easy-to-use, modern alternative to legacy AMS products (Protech-class capabilities, modular delivery, honest roadmap).

## Try the prototype

1. **Marketing** — `http://localhost:3000/` — full Protech-style story, Live/Roadmap labels, product spotlights.
2. **Sign up** — Clerk org → lands on `/{orgSlug}` overview with sidebar navigation.
3. **Live modules**
   - **MemberCore** — `/{orgSlug}/members` — directory, search, staged CSV import, export.
   - **PulsePoint Events** — `/{orgSlug}/events` — create, publish, public `/{orgSlug}/e/{slug}`, check-in.
   - **PulsePoint Work** — `/{orgSlug}/work` — hub to all modules + exceptions.
   - **Import review** — `/{orgSlug}/members/imports`
   - **Exceptions** — `/{orgSlug}/exceptions`
   - **Settings** — `/{orgSlug}/settings`
4. **Roadmap modules** — Learn, Giving, Commerce, Engage, AI, Insights — preview cards with honest copy.

## Design system

- Tokens: `app/globals.css` (`--pc-navy`, `--pc-accent`, `.pc-card`, `.pc-table`, `.pc-btn-*`)
- Shell: sidebar `components/app-sidebar.tsx` + `components/app-shell.tsx`
- Nav config: `lib/nav-config.ts`

## What to demo to leadership

| Story | Where |
|-------|--------|
| “Easier than legacy AMS” | Sidebar + MemberCore table + public event page |
| “We don’t overclaim” | Roadmap product pages + marketing Live/Roadmap badges |
| “Safe member data” | Import review + `docs/TEN-MEMBER-LEAK-CHECKS.md` |
| “Ops when automation fails” | Exception queue |

## Seed demo data (for leadership walkthroughs)

```bash
DATABASE_URL="..." pnpm db:seed:demo
```

Creates org **Sterling Healthcare Association** (`demo-healthcare`) with:

- 50 members (mix of ACTIVE / LAPSED / INACTIVE, tags, credentials, states)
- 4 events: 1 completed town hall, 1 upcoming free advocacy briefing,
  1 upcoming paid clinical summit, 1 draft chapter mixer
- Registrations: confirmed, paid (Stripe placeholder), waitlist, pending, cancelled
- 12 staff notes across members
- 3 automation exception rows (2 open, 1 resolved)
- 1 pending CSV import batch (with a duplicate detected) + 1 historic applied batch
- Audit log entries

The seed is **idempotent** — rerun safely; it wipes only the `demo-healthcare` org.

To own the seeded org with your real Clerk login, set in `.env.local`:

```
DEMO_OWNER_USER_ID=user_2yourClerkId
```

Then sign in and visit `http://localhost:3000/demo-healthcare`.

## Commands

```bash
pnpm dev
pnpm db:seed:demo
pnpm test
pnpm leak:checks
```
