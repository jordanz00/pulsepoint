# Exceptions queue drill — email failure

**Queue URL:** `/{orgSlug}/exceptions`  
**Runbook:** [RUNBOOK.md](./RUNBOOK.md) §2  
**Demo org:** `demo-healthcare` (Sterling Healthcare Association)

Staff must see partial automation failures in-queue—not silent drops. Registration stays authoritative when email fails.

---

## Option A — Seeded demo (fastest, no env)

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm demo:setup
pnpm dev
```

1. Open http://localhost:3000/demo → **Enter overview only**
2. Go to `/demo-healthcare/exceptions`
3. Confirm open rows include:
   - `registration.confirm_email` / `resend.send` (rate limit message)
   - `stripe.checkout.completed` / `registration.lookup`
4. Resolve one row → verify it leaves the open list

**Say:** “Registration succeeded; email did not. Staff triages here without calling IT.”

---

## Option B — Live drill (force email fail)

Simulates provider failure on the next outbound email (public registration confirm).

```bash
PULSE_DRILL_EMAIL_FAIL=true pnpm dev
```

1. Open a **published free** event public page: `/demo-healthcare/e/{publicSlug}`
2. Submit registration with a new email
3. Confirm API returns `ok: true` (registration created)
4. Open `/demo-healthcare/exceptions`
5. Find new row: workflow `registration.confirm_email`, step `email.adapter.send`
6. Mark resolved after verifying registration row in admin

Unset `PULSE_DRILL_EMAIL_FAIL` for normal dev.

---

## Verification checklist

| Step | Expected |
|------|----------|
| Registration in DB | `CONFIRMED` or `PENDING`—not rolled back |
| Exception row | `PARTIAL_SUCCESS`, readable message |
| Triage UX | Workflow, step, time, resolve action |
| Audit | No stack trace in UI |

---

## CI / staging

- Seeded exceptions: `prisma/seed-demo.ts` → `seedExceptions()`
- E2E smoke: `tests/e2e/demo-wedge.spec.ts` → exceptions queue visible in demo
