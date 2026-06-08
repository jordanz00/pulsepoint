# Stripe pilot drill

**Owner:** _TBD_ (see `docs/PILOT-PLAYBOOK.md`)

## Preconditions

- Staging `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` set
- Webhook endpoint: `https://<staging>/api/webhooks/stripe`
- One published paid event in pilot org

## Drill steps

1. Register test card `4242 4242 4242 4242` on public event checkout
2. Confirm registration moves PENDING → CONFIRMED in admin
3. Verify `AuditLog` row for payment
4. Force webhook replay from Stripe dashboard — confirm idempotency (no duplicate CONFIRMED)
5. Issue test refund — confirm state + audit

## Pass criteria

- [ ] Webhook signature verified
- [ ] Idempotency key honored
- [ ] Named owner signed in PILOT-PLAYBOOK

See `docs/RUNBOOK.md` for replay and drift recovery.

---

## Local webhook replay (dev / staging prep)

Use when registration or commerce order stays **PENDING** after a successful test checkout.

### Prerequisites

- [Stripe CLI](https://stripe.com/docs/stripe-cli) installed and logged in (`stripe login`)
- App running locally with `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` in `.env.local`
- `PAYMENT_ADAPTER=stripe` (not `manual`) for real signature verification

### Forward webhooks to localhost

```bash
# Terminal 1 — dev server
pnpm dev

# Terminal 2 — forward signed events (copy the whsec_ secret into STRIPE_WEBHOOK_SECRET)
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Complete a paid registration or commerce checkout in the browser. Confirm the CLI shows `checkout.session.completed` with HTTP 200.

### Replay after a fix

1. Open [Stripe Dashboard → Developers → Events](https://dashboard.stripe.com/test/events).
2. Find the `checkout.session.completed` event for the test session.
3. Click **Resend** (or **Send test webhook** in CLI: `stripe trigger checkout.session.completed`).
4. Verify idempotency: registration/order status unchanged if already CONFIRMED; no duplicate audit rows.

### CLI smoke (no browser)

```bash
stripe trigger checkout.session.completed
```

Expect `200` from `/api/webhooks/stripe`. If `400` signature error, `STRIPE_WEBHOOK_SECRET` does not match the `stripe listen` output.

### Pass criteria (local)

- [ ] First delivery moves PENDING → CONFIRMED
- [ ] Replay does not double-confirm
- [ ] Mismatch metadata creates `AutomationException`, not silent success

Drill owner signs off in `docs/PILOT-PLAYBOOK.md` before pilot go-live.
