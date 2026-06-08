# Contributing to PulsePoint

## Assisted development

Use your editor’s assistive tools for boilerplate, tests, copy drafts, and docs. **Do not** merge sensitive paths without a human diff and threat model:

| Path | Risk |
|------|------|
| `lib/permissions.ts` | Authorization bypass |
| `lib/auth.ts` | Cross-org access |
| `app/api/webhooks/stripe/route.ts` | Money without payment |
| `app/api/public/register/route.ts` | Abuse, spam, IDOR |
| `app/actions/member-import.ts` | Mass PII write |
| `app/actions/members.ts` (delete/export) | Data exfiltration |
| `lib/webhook-trust.ts`, `lib/webhook-idempotency.ts` | Replay / wrong tenant |

After touching sensitive paths, run:

```bash
pnpm security:audit
pnpm test
```

and complete the checklist in `docs/SECURITY-PARANOID.md`.

## Invariants ship with features

- **Tenant scope:** `getOrgDb(orgId)` for all member/event data
- **Capabilities:** `requireCapability()` on server actions
- **State machines:** `lib/registration-state.ts`, `lib/event-state.ts`
- **Idempotency:** Stripe/Clerk webhook claim tables
- **Automations:** `runSoftFailStep` → `AutomationException` queue, not silent failure
- **Import:** stage → `/{orgSlug}/members/imports` → apply; never direct CSV → `Member`

## Commands

```bash
pnpm db:migrate
pnpm test
pnpm demo:setup && pnpm test:e2e   # before UI / advocacy changes
pnpm security:audit
pnpm claims:validate
```

PRs to `main` must pass **CI / quality** and **E2E (demo wedge) / playwright** — see [docs/E2E-CI.md](docs/E2E-CI.md).

## Marketing honesty

See `docs/PRODUCT-CLAIMS.md`. Do not mark roadmap modules as live in decks or UI.
