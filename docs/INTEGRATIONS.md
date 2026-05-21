# PulsePoint integrations

## Standard endpoints (v0.1)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Uptime / monitoring |
| `POST /api/public/register` | Public event registration (rate-limited, Zod) |
| `POST /api/webhooks/stripe` | Payment confirmation (signed, idempotent) |
| `POST /api/webhooks/clerk` | User/org sync (Svix signed) |

## Server actions (internal UI contract)

Staff UI uses Next.js server actions in `app/actions/*` — not a public REST API yet. External systems should **not** depend on these without a versioned API layer.

## Planned REST v1 (roadmap)

- `Authorization: Bearer <org-scoped token>` (IT-issued)
- JSON envelope with `_meta.source`, `_meta.validationStatus`
- Same tenant rules as `getOrgDb`

## Webhook metadata contract (Stripe)

Required metadata on checkout sessions:

- `orgId` — must match registration row org
- `registrationId` — PulsePoint `EventRegistration.id`
- `eventId` — for audit

## Middleware / Zapier

Prefer **push to exception queue** on partial failure rather than silent stop. Subscribe to `AutomationException` rows (future: outbound webhook).
