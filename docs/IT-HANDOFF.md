# IT Handoff — PulsePoint AMS (Main Application)

**Audience:** Hospital association IT, security, and procurement reviewers.  
**Scope:** Next.js staff console at `/app`, `/lib` — not ad-ops API (`packages/api`).

## What ships today

| Layer | Technology | Notes |
|-------|------------|-------|
| Web | Next.js 16 on Vercel or Azure | `pnpm build` / `pnpm start` |
| Database | SQLite (local demo) or **Neon Postgres** (pilot/production) | See `prisma/schema.prisma` |
| Staff auth | Clerk (default) or **Microsoft Entra** (`INTEGRATION_PROFILE=pilot-entra`) | See `docs/ENTRA-PILOT-SETUP.md` |
| Payments | Stripe webhooks | Signature verified; idempotent |
| Tenant isolation | `orgId` on all domain tables + `getOrgDb(orgId)` | `lib/db.ts`, `lib/tenant-guards.ts` |

**Live modules:** Work overview, MemberCore directory, EventCore registration/check-in.  
**Alpha modules:** Advocacy, committees, CRM, commerce, engage, insights — see `lib/products.ts`.

## Pilot setup (first-run)

New orgs see a **Pilot setup** checklist on Home (`/{orgSlug}`) until MemberCore + Events wedge criteria are met (members, staff, published event). Auto-hides when complete. Guide: `docs/PILOT-SETUP-CHECKLIST.md`.

## Auth profiles

| Profile | Env | Middleware | Staff session |
|---------|-----|------------|---------------|
| `demo` | `DEMO_MODE=true` + secret | Demo cookie | Fixed demo owner |
| Clerk (default prod) | Unset `DEMO_MODE`, Clerk keys | Clerk | `lib/auth.ts` + Clerk org |
| `pilot-entra` | `INTEGRATION_PROFILE=pilot-entra` | Entra session cookie | `lib/entra-session.ts` |

**Rules:**

- Never set `DEMO_MODE=true` with `pilot-entra` or `hap-azure` (blocked by `lib/security/production-guards.ts`).
- Production: set `PULSE_STRICT_PRODUCTION_GUARDS=true` to fail boot on guard violations.

## Required production environment

```env
INTEGRATION_PROFILE=pilot-entra
DATABASE_URL=postgresql://...-pooler.../neondb?pgbouncer=true
DIRECT_URL=postgresql://.../neondb
ENTRA_TENANT_ID=
ENTRA_CLIENT_ID=
ENTRA_CLIENT_SECRET=
ENTRA_SESSION_SECRET=<32+ chars>
ENTRA_REDIRECT_URI=https://your-domain/api/auth/entra/callback
ENTRA_DEFAULT_ORG_SLUG=<your-org-slug>
NEXT_PUBLIC_APP_URL=https://your-domain
CRON_SECRET=<24+ chars>
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Unset `DEMO_MODE` on customer production. See `docs/STAGING-LAUNCH.md`.

## RBAC

Capabilities enforced in **server actions** and **sensitive RSC pages**:

- `lib/permissions.ts` — capability → minimum role
- `lib/admin-page-guard.ts` — page-level gates (audit, imports, staff settings)
- `requireCapability()` in `app/actions/*`

Roles: `STAFF` < `ADMIN` < `OWNER` (`OrgMembership.role`).

## Audit & compliance

- Staff mutations write to `AuditLog` via `lib/audit.ts` (PII redacted in diffs).
- Audit log UI: `/{orgSlug}/audit` — **ADMIN+ only** (`org:settings`).
- PHI is **out of scope** — do not store clinical records. See `SECURITY.md`.

## Fundraising

- Staff: `/{orgSlug}/giving` · Public: `/{orgSlug}/give`
- Capabilities: `giving:read` (STAFF), `giving:manage` (ADMIN)
- Guide: `docs/FUNDRAISING.md`

## Committees & governance

- Admin routes: `/{orgSlug}/committees`, `/{orgSlug}/committees/{id}`
- Capabilities: `committee:read` (STAFF), `committee:write` (ADMIN)
- Full module guide: `docs/COMMITTEES.md`

## Event registration pricing

- Public register + checkout share `lib/events/resolve-registration-price.ts`.
- Ticket type overrides event base price; promo applies once at registration (`consumePromo: true`).
- Checkout re-reads `ticketTypeId` + `promoCodeUsed` without re-consuming promo.

## Member portal account linking

- `Member.clerkUserId` connects Clerk sign-in → roster record.
- **Auto-link:** first portal visit matches `User.email` to one `Member.email` (case-insensitive).
- **Staff:** member profile → Portal access panel (`member:write`) — link by email, manual Clerk ID, or unlink.
- Actions: `app/actions/portal-link.ts`; logic: `lib/portal/link-portal-member.ts`.

## Member portal payments

- Pending dues invoices appear under **My invoices** with a **Pay** action.
- Checkout reuses existing `CommerceOrder` rows (e.g. from renewal sweep cron).
- Server action: `app/actions/portal-commerce.ts` → `startPortalPendingOrderCheckout`.
- Paid DUES orders extend `renewalDueAt` via `lib/renewals/apply-dues-payment.ts`.

## Data export

| Export | Capability | Audit |
|--------|------------|-------|
| Member CSV | `member:export` (ADMIN) | Yes |
| Audit CSV | `org:settings` | Yes |

## Backups & DR

- Policy: `docs/BACKUP-REQUIREMENTS.md`
- Health: `GET /api/health`, `pnpm continuity:health`
- Warehouse export (optional): `pnpm continuity:export`

## Security review checklist

- [ ] `pnpm security:audit` and `pnpm test tests/unit/security-*.test.ts`
- [ ] Entra redirect URIs registered; no demo mode on production
- [ ] Stripe + Clerk webhooks pointed at production URLs
- [ ] Terms/Privacy finalized (`app/terms`, `app/privacy`)
- [ ] Subprocessors documented (`docs/SUBPROCESSORS.md`)

## Deploy steps (pilot)

1. Provision Neon Postgres; run `pnpm exec prisma migrate deploy`
2. Configure Vercel env per `docs/STAGING-LAUNCH.md`
3. Seed pilot org: `pnpm demo:setup` (or association-specific seed)
4. Onboard 3–5 Entra users per `docs/ENTRA-PILOT-SETUP.md`
5. Run `pnpm leak:checks` before go-live

## Support contacts

- Security issues: see `SECURITY.md`
- Ad-ops API (separate): `docs/ad-ops/IT-HANDOFF.md`
