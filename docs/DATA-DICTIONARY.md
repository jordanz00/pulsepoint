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
| `AdvocacyIssue` | Priority policy issue | `orgId` + optional `publicSlug` |
| `AdvocacyCampaign` | Take-action / grassroots campaign | `orgId` |
| `LearnVideoPlaylist` | CE/workforce video group (alpha) | `orgId` |
| `LearnWorkforceProgram` | Pipeline / mentorship / scholarship program (alpha) | `orgId` |
| `LearnProgramEnrollment` | Member enrolled in workforce program | `orgId` |

## Advocacy issue (alpha)

| Field | Type | Rules |
|-------|------|-------|
| `issueArea` | enum | ACCESS_TO_CARE, MATERNAL_HEALTH, WORKPLACE_VIOLENCE, BEHAVIORAL_HEALTH, SUBSTANCE_USE, SDOH_FOOD_ACCESS, PHYSICIAN_ACCESS, NURSING_WORKFORCE, GENERAL |
| `publicSlug` | string? | Unique per org; drives `/advocacy/issues/[slug]` |
| `contentMeta` | JSON | Include `validationStatus: illustrative_only` until SME review |
| `summary` | string | No unverified legal claims in production without SME |

## Member workforce persona (alpha)

| Field | Type | Rules |
|-------|------|-------|
| `workforcePersona` | enum | NONE, STUDENT, NEW_GRAD, CAREER_CHANGER, EXPERIENCED, EMPLOYER_PARTNER |

## Event career fair (alpha)

| Field | Type | Rules |
|-------|------|-------|
| `eventKind` | enum | STANDARD (default), VIRTUAL_CAREER_FAIR |

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
