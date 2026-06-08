# Committee management

PulsePoint committees module — standing committees, councils, rosters, officers, and meeting schedules.

## Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/{orgSlug}/committees` | `committee:read` | List all committees |
| `/{orgSlug}/committees/{id}` | `committee:read` | Detail: profile, officers, roster, meetings |

## Permissions

| Capability | Minimum role | Actions |
|------------|--------------|---------|
| `committee:read` | STAFF | View committees, rosters, schedules |
| `committee:write` | ADMIN | Create, edit, archive, roster, officers, meetings |

Enforced in:

- `lib/admin-page-guard.ts` — page access
- `app/actions/committees.ts` — `requireCapability("committee:write")`

## Data model

- **Committee** — name, kind (`STANDING`, `ADVISORY`, `TASK_FORCE`, `COUNCIL`), department, description, `isActive`
- **CommitteeMembership** — member, `officerRole`, title, term dates, `isCurrent`
- **CommitteeMeeting** — `startsAt`, `endsAt`, location, virtual URL, agenda, status

Officer roles: `CHAIR`, `VICE_CHAIR`, `SECRETARY`, `TREASURER`, `MEMBER_AT_LARGE`, `MEMBER`.

**Business rule:** one active `CHAIR` per committee — assigning a new chair demotes the previous chair to `MEMBER`.

## Server actions

| Action | File |
|--------|------|
| `createCommittee` | `app/actions/committees.ts` |
| `updateCommittee` | |
| `archiveCommittee` | |
| `addCommitteeMember` | |
| `updateCommitteeMember` | |
| `removeCommitteeMember` | |
| `scheduleCommitteeMeeting` | |
| `updateCommitteeMeeting` | |
| `cancelCommitteeMeeting` | |

## Shared libraries

- `lib/validations/committee.ts` — Zod schemas
- `lib/committees/officer-roles.ts` — role labels and chair policy
- `lib/committees/meeting-policy.ts` — schedule validation
- `lib/committees/load-committees.ts` — list and detail loaders

## Audit trail

All write actions log to `AuditLog` with actions prefixed `committee.*`.

## Tests

```bash
pnpm exec vitest run tests/unit/committee-validation.test.ts
pnpm exec vitest run tests/unit/committee-officer-policy.test.ts
pnpm exec vitest run tests/unit/committee-meeting-policy.test.ts
```

## Demo

After `pnpm db:seed:demo`, open `/demo-healthcare/committees` for Government Affairs Committee and Quality Council sample data.
