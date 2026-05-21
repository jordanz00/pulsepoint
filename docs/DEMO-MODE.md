# PulsePoint demo mode

Demo mode lets anyone click through the PulsePoint prototype as the owner of
a fully seeded sample association — without creating a Clerk account or
touching the Clerk dashboard. It exists because:

- Leadership / stakeholder previews need a one-click sign-in.
- Local dev shouldn't require Clerk setup just to look around.
- A weekend evaluator should be able to run `pnpm db:seed:demo` and go.

> **Demo mode is prototype-only.** It is gated by three independent checks
> and refuses to activate in production. See "Safety rails" below.

---

## How to enable (local)

1. Make sure `.env.local` has:

   ```dotenv
   DEMO_MODE=true
   DEMO_SESSION_SECRET=<32+ random chars; `openssl rand -hex 32` works>
   ```

2. Seed the demo organization:

   ```bash
   pnpm db:seed:demo
   ```

3. Start the app and visit `/demo`:

   ```bash
   pnpm dev
   # then open http://localhost:3000/demo
   ```

4. Click **Enter demo as Sterling Healthcare owner**. You'll land at
   `/demo-healthcare` as the demo OWNER. A bright banner sits across the
   top of every page while demo mode is active.

5. To exit, click **Exit demo** in the banner (clears the cookie + audit log).

---

## What demo mode actually does

| Surface | Behavior |
| --- | --- |
| `/demo` page | Always public. Shows enable / seed instructions, or the Enter button. |
| `POST /api/demo/enter` | Sets an HMAC-signed cookie (`pp_demo`) valid for 24h. Writes `demo.entered` audit log. |
| `POST /api/demo/exit` | Clears the cookie. Writes `demo.exited` audit log. |
| `lib/auth.ts` | `requireStaffSession` and `requireOrgAccessForSlug` check the demo cookie **before** calling Clerk. If valid, you are the seeded demo owner. |
| Middleware | Skips `auth.protect()` only when (a) demo mode is enabled and (b) the cookie is present. |
| Root layout | Renders `<DemoBanner />` whenever demo mode + valid cookie are present. |

The demo identity is fixed and tied to the seed:

```
userId  = "user_demo_owner"
orgId   = "org_demo_pulsepoint"
orgSlug = "demo-healthcare"
role    = OWNER
```

There is no way to impersonate a real Clerk user — everyone who enters demo
mode shares the same seeded identity.

---

## Safety rails (defense in depth)

1. **Production refusal.** `lib/demo-mode.ts` exports
   `assertDemoModeNotInProduction()`, which is called at module import. If
   `NODE_ENV === "production"` AND `DEMO_MODE === "true"`, the module throws
   `DEMO_MODE_IN_PRODUCTION` and the app fails to boot.
2. **Env-flag gate.** `isDemoModeEnabled()` returns false unless
   `DEMO_MODE === "true"` AND `DEMO_SESSION_SECRET` is 32+ chars.
3. **HMAC-signed cookie.** Cookies are signed `HMAC-SHA256` with the server
   secret. An attacker on a deployed preview cannot forge a cookie without
   the secret.
4. **Slug check.** `requireOrgAccessForSlug` honors the demo cookie ONLY for
   the demo org's slug (`demo-healthcare`). Visiting any other org URL still
   requires real Clerk auth.
5. **Audit log.** Every enter / exit writes a `DemoSession` audit row.
6. **Static audit.** `scripts/security-audit.sh` fails CI if any tracked
   file hard-codes `DEMO_MODE=true` (e.g. accidentally committed `.env`).

---

## Pre-deploy checklist

Before deploying any preview or production environment:

- [ ] Hosting env does not set `DEMO_MODE=true`. (Vercel / Render / Fly etc.)
- [ ] `DEMO_SESSION_SECRET` is unset (or explicitly empty) in the hosting env.
- [ ] CI runs `pnpm security:audit` (which calls
      `scripts/security-audit.sh` and fails on tracked `DEMO_MODE=true`).
- [ ] If you really need a hosted prototype preview with demo mode on, run
      it under `NODE_ENV=development` or `NODE_ENV=test`, never `production`.

---

## Removing demo mode entirely

If you want to delete demo mode in a future PR, the touchpoints are:

- `lib/demo-mode.ts`
- `lib/auth.ts` (demo bypass blocks inside `requireStaffSession` /
  `requireOrgAccessForSlug`)
- `middleware.ts` (the `isDemoModeAllowed()` short-circuit)
- `app/api/demo/enter/route.ts`, `app/api/demo/exit/route.ts`
- `app/demo/page.tsx`
- `components/demo-banner.tsx`
- `app/layout.tsx` (import + render)
- `tests/unit/demo-mode.test.ts`
- `.env.local.example` (entries)
- This doc.

Everything else (Clerk, the rest of auth, every permission check) is
unchanged by demo mode — it sits in front of Clerk, not on top of it.
