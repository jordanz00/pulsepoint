# PulsePoint data dictionary (MemberCore MVP)

**Rule:** If it isn’t documented here, don’t build a UI field for it.

## Canonical entities

| Entity | Purpose | Tenant key |
|--------|---------|------------|
| `Organization` | One association customer | `id` |
| `Member` | Person record | `orgId` |
| `MemberNote` | **Staff notes** (calls, context) | `orgId` + `memberId` |
| `Event` | Program / conference | `orgId` |
| `EventRegistration` | Attendee row (member or guest) | `orgId` |
| `AuditLog` | Who changed what | `orgId` |
| `AutomationException` | Soft-fail partial automation | `orgId` |

## Member fields

| Field | Type | Rules |
|-------|------|-------|
| `firstName`, `lastName` | string | Required, max 100 |
| `email` | string? | Lowercased; unique per org when present |
| `phone` | string? | Max 30 chars |
| `status` | enum | ACTIVE, INACTIVE, LAPSED |
| `tags` | string[] | Max 20 tags |
| `customFields` | JSON | **Structured attrs only** — not staff notes |
| `clerkUserId` | string? | Portal link when set |

## Where to put data (anti-confusion)

| Data type | Put it here | Not here |
|-----------|-------------|----------|
| Staff call notes | `MemberNote.body` | `customFields`, Excel |
| Pipeline / deal stage | Future CRM module | Random tags |
| Payment state | `EventRegistration.status`, `paidAt` | Member record |
| Internal errors | `AutomationException` | Email only |

## Permissions (enforced server-side)

See `lib/permissions.ts` — e.g. `member:export` requires **ADMIN**. Pass `orgSlug` from UI so `ORG_MISMATCH` blocks cross-org bookmarks.

## Deletion policy

- Members **with any** `EventRegistration` cannot be deleted (audit trail).
- Delete writes audit `snapshot` of name/email.
- Notes deleted with member when delete is allowed.
