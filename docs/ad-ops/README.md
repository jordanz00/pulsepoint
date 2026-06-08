# PulsePoint Ad-Ops (Healthcare Advertising AMS)

**Canonical repo:** `/Users/jordanzabady/Desktop/pulse` only. The `Cursor Projects/pulsepoint-ams` copy is archived — see its `MIGRATED.md`.

## What this is

System of record for healthcare advertising operations: campaigns, NPI validation, MLR gates, PulsePoint DSP sync, reconciliation, and pacing. The DSP remains the execution layer.

## Packages

| Package | Path | Role |
|---------|------|------|
| `@ams/shared` | `packages/shared` | State machines, NPI, runbooks, RBAC |
| `@ams/api` | `packages/api` | Fastify + Prisma API (port 4000) |
| `@ams/worker` | `packages/worker` | BullMQ sync processor |

## UI routes

Admin console: `/[orgSlug]/advertising/*` (campaigns, sync, metrics, audit, onboarding, runbooks).

## Quick start

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm install
pnpm demo:setup
pnpm ad-ops:setup
pnpm dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| Ad-ops API | http://localhost:4000/health |
| Demo ad-ops | http://localhost:3000/demo-healthcare/advertising |

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [IT-HANDOFF.md](./IT-HANDOFF.md)
- [COMPLIANCE-HIPAA.md](./COMPLIANCE-HIPAA.md)
- [THREAT-MODEL.md](./THREAT-MODEL.md)
- [DATA-CLASSIFICATION.md](./DATA-CLASSIFICATION.md)
- [SECURITY-AD-OPS.md](./SECURITY-AD-OPS.md)

## Feature flag

Set `AD_OPS_ENABLED=true` (default) to show advertising routes. Disable for association-only pilots.
