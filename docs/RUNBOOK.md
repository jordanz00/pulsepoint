# PulsePoint runbook (internal support)

**On-call owner:** assign per environment before go-live.  
**Exception queue:** `/{orgSlug}/exceptions` (AutomationException rows).

---

## 1. Stripe paid, DB registration still PENDING

| Field | Value |
|-------|--------|
| **Owner** | Platform ops + finance liaison |
| **Symptoms** | Stripe Dashboard shows `checkout.session.completed`; member still PENDING; exception `stripe.checkout.completed` |
| **Replay** | Safe to retry Stripe webhook after fix (idempotency via `claimWebhookEvent`) |

**Steps**

1. Open `/{orgSlug}/exceptions` → filter workflow `stripe.checkout.completed`.
2. From Stripe event metadata, note `registrationId`, `orgId`, `eventId`.
3. In DB: `EventRegistration` row must exist and `status` should transition `PENDING` → `CONFIRMED` only via state machine.
4. If metadata mismatch: **do not** force-update; fix Stripe session metadata and replay.
5. If row missing: create exception resolution note; manual CONFIRMED only after verifying payment amount and guest email match Stripe.
6. Resolve exception row after DB matches Stripe.

---

## 2. Confirmation email failed (registration succeeded)

| Field | Value |
|-------|--------|
| **Owner** | App support |
| **Symptoms** | Registration CONFIRMED/PENDING in DB; guest no email; exception `registration.confirm_email` |

**Steps**

1. Registration is authoritative—do not cancel paid reg because email failed.
2. Check Resend dashboard + API key on Vercel.
3. Resend manually from staff mailbox if urgent; mark exception resolved.
4. If rate limit (`register:send:`): wait window or whitelist guest for one-off send.

---

## 3. CSV import wrong / duplicate members

| Field | Value |
|-------|--------|
| **Owner** | Data steward (ADMIN) |
| **Symptoms** | Wrong names, duplicate emails, applied batch too early |

**Steps**

1. **Never** re-upload hoping to fix—imports are **staged** at `/{orgSlug}/members/imports`.
2. Pending batch: **Reject batch** before Apply.
3. Already applied: use member edit/delete (delete blocked if event registrations exist).
4. Audit: `AuditLog` actions `member.import_staged`, `member.import_applied`, `member.import_rejected`.
5. Cutover: export from legacy AMS → stage → review duplicates (SKIPPED_DUPLICATE) → apply once.

---

## 4. Staff cannot export members

| Field | Value |
|-------|--------|
| **Owner** | Org admin (Clerk) |
| **Symptoms** | Export button errors or forbidden |

**Steps**

1. Confirm Clerk org role is **ADMIN** (`OrgMembership.role`).
2. Capability required: `member:export` (ADMIN only).
3. Check audit log for denied attempts.

---

## 5. Cross-org data concern

| Field | Value |
|-------|--------|
| **Owner** | Engineering |
| **Severity** | P1 |

**Steps**

1. User’s active Clerk org must match URL `orgSlug`.
2. Run `pnpm test` — `db-scope` tests must pass.
3. No `prisma.member` / `prisma.event` in app code—only `getOrgDb(orgId)`.
4. Escalate with audit log + user id; freeze deploy if confirmed leak.

---

## 6. Webhook replay (Stripe / Clerk)

| Field | Value |
|-------|--------|
| **Owner** | Engineering |

- Idempotency prevents double-apply (`claimWebhookEvent`).
- Replay from provider dashboard after fixing root cause.
- Stripe: verify signature secret `STRIPE_WEBHOOK_SECRET` matches endpoint.

---

## 7. Health check

- `GET /api/health` → `{ ok: true }` for uptime monitors.

---

## Related docs

- `docs/SUBPROCESSORS.md` — IT questionnaire
- `docs/PRODUCT-CLAIMS.md` — what we may say publicly
- `docs/SCOPE.md` — wedge vs Protech parity
- `CONTRIBUTING.md` — sensitive path review
