# Pilot setup checklist

First-run guide on org **Home** (`/{orgSlug}`) for hospital association staff piloting PulsePoint AMS.

## Purpose

Empty or newly provisioned orgs see a **Pilot setup** panel above KPIs. It replaces ad-hoc onboarding with a single wedge path aligned to [PILOT-EXECUTION-STATUS.md](./PILOT-EXECUTION-STATUS.md) and [REALIZATION-PLAN.md](./REALIZATION-PLAN.md) Block 1.

The checklist **auto-hides** when all required steps are complete — no manual dismiss.

## Required steps (wedge)

| Step | Complete when | Deep link |
|------|---------------|-----------|
| Members on file | `Member.count > 0` | Imports (empty org) or directory |
| Invite staff | `OrgMembership.count >= 2` | Settings → Staff |
| Create an event | `Event.count > 0` | New event or events list |
| Publish an event | `Event.status = PUBLISHED` | Draft event editor or events list |

## Recommended step

| Step | Complete when |
|------|---------------|
| Confirm a registration | `EventRegistration.status = CONFIRMED` |

## Implementation

| File | Role |
|------|------|
| `lib/onboarding/pilot-setup-checklist.ts` | Signal queries + pure checklist builder |
| `components/admin/pilot-setup-checklist.tsx` | Overview UI |
| `components/admin/overview-dashboard.tsx` | Renders checklist (non-demo orgs) |

Demo org (`demo-healthcare`) uses `DemoHomeDashboard` with the guided tour instead.

## Tests

```bash
pnpm exec vitest run tests/unit/pilot-setup-checklist.test.ts
```

## Operator verification

1. Provision a fresh org (or truncate members/events on staging).
2. Sign in as staff → open `/{orgSlug}`.
3. Confirm **Pilot setup** appears with 0/4 required.
4. Complete each step → panel disappears when published event + members + 2 staff exist.
