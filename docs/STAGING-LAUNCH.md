# Staging launch — Vercel + Neon (pilot)

## Fast path (30-day pilot)

| Layer | Service |
|-------|---------|
| Web | Vercel (Next.js 16) |
| Database | Neon Postgres (pooled `DATABASE_URL`) |
| Auth | Entra (`INTEGRATION_PROFILE=pilot-entra`) |
| Payments | Stripe test → live per association |
| Ad-ops API | Optional: Railway/Fly for `@ams/api` + Redis, or demo-only |

## Environment (Vercel)

```env
INTEGRATION_PROFILE=pilot-entra
DATABASE_URL=postgresql://...-pooler.../neondb?pgbouncer=true
DIRECT_URL=postgresql://.../neondb
ENTRA_TENANT_ID=
ENTRA_CLIENT_ID=
ENTRA_SESSION_SECRET=
ENTRA_REDIRECT_URI=https://staging.pulsepointams.com/api/auth/entra/callback
ENTRA_DEFAULT_ORG_SLUG=demo-healthcare
NEXT_PUBLIC_APP_URL=https://staging.pulsepointams.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Unset `DEMO_MODE` on staging.

**Org slug:** Use the same slug as your seeded pilot org (`demo-healthcare` after `pnpm demo:setup`). If you create a separate `pilot-healthcare` org, set `ENTRA_DEFAULT_ORG_SLUG` to match and seed that org before first login.

## Deploy steps

1. Connect GitHub repo to Vercel
2. Set env vars in Vercel project settings
3. `pnpm exec prisma migrate deploy` via build command or one-off
4. Register Stripe webhook → `https://staging.../api/webhooks/stripe`
5. Register Entra redirect URI
6. Onboard 3–5 users per `docs/PILOT-PLAYBOOK.md`

## Azure path (post-pilot)

See `docs/ENTERPRISE-INTEGRATION.md` and `docs/ad-ops/IT-HANDOFF.md` for Container Apps + Azure Postgres.

## Health checks

- `GET /api/health`
- `GET http://localhost:4000/health` (ad-ops, if hosted)
- `pnpm continuity:health`
