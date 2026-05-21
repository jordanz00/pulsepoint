# Deploy PulsePoint (Phase 0)

## Vercel + Neon (recommended)

1. **Neon** — Create a Postgres project; copy `DATABASE_URL`.
2. **Clerk** — Production instance with Organizations enabled.
3. **Vercel** — Import the `pulse` GitHub repo (root directory `.`).
4. Set environment variables (Production + Preview):

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Neon |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CLERK_SECRET_KEY` | Clerk |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook |
| `STRIPE_SECRET_KEY` | Stripe test/live |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook |
| `RESEND_API_KEY` | Resend |
| `RESEND_FROM_EMAIL` | Verified domain |
| `SENTRY_DSN` | Optional |

5. **Build command:** `pnpm build` (runs `prisma generate` via `postinstall`).
6. **Migrate production DB:**

   ```bash
   DATABASE_URL="..." pnpm exec prisma migrate deploy
   ```

7. Register webhooks:
   - Clerk → `https://your-app.vercel.app/api/webhooks/clerk`
   - Stripe → `https://your-app.vercel.app/api/webhooks/stripe`

## Verify after deploy

- [ ] Sign up → create organization → land on `/{orgSlug}`
- [ ] Clerk webhook creates `Organization` row + audit log `organization.created`
- [ ] Create a member and event; publish event; open `/{orgSlug}/e/{slug}` without login
- [ ] Free registration sends email (if Resend configured)

## GitHub

```bash
cd /Users/jordanzabady/Desktop/pulse
git init
git add .
git commit -m "feat: PulsePoint Phase 0–3 scaffold (AMS MVP)"
gh repo create pulsepoint --private --source=. --push
```

(Requires `gh auth login`.)
