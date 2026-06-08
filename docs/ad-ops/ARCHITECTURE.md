# Architecture — PulsePoint AMS

**Last reviewed:** 2026-05-22 · **Stage:** v0.1 (pre-IT handoff)

PulsePoint AMS is the **system of record** for healthcare advertising operations: campaigns, compliance, workflows, reconciliation, and reporting normalization. PulsePoint (the DSP) remains the **execution layer** for targeting, delivery, and optimization. The AMS does not replace it.

---

## 1. Components

| Service | Path | Stack | Purpose |
|---|---|---|---|
| **API** | `packages/api` | Fastify 5 + Prisma 6 + Zod | REST endpoints, RBAC, workflow state machines, audit logging, sync enqueue, recon, pacing |
| **Worker** | `packages/worker` | BullMQ 5 + ioredis | Processes sync jobs (PulsePoint push), retry/DLQ, idempotency |
| **Web** | `packages/web` | Next.js 15 (App Router) + React 19 | Operator UI: campaigns, creatives, audit, sync, runbooks, metrics |
| **Shared** | `packages/shared` | TypeScript | State machines, NPI validation (Luhn), error registry, RBAC roles, runbooks |
| **Database** | n/a | PostgreSQL 16 | Single-source-of-truth store; `Decimal(14,2)` money, `Decimal(14,4)` metrics |
| **Queue** | n/a | Redis 7 | BullMQ broker for sync jobs |

## 2. Local topology (development)

```
┌─────────────────────────────────────────────────────────────┐
│ Developer workstation                                       │
│                                                             │
│   Next.js (3001) ──HTTP──▶ Fastify API (4000) ──Prisma──▶   │
│                                          │                  │
│                                          └─enqueue──▶ Redis │
│                                                       │     │
│                                  Worker ◀─poll────────┘     │
│                                                             │
│                          docker-compose: Postgres 5433,     │
│                                          Redis 6380         │
└─────────────────────────────────────────────────────────────┘
```

Auth in dev: `X-AMS-User-Email` header → seeded user. **Production disables this path** (Phase 2).

## 3. Target production topology (Azure)

```
                        ┌──────────────────────────┐
                        │  Microsoft Entra ID      │
                        │  (tenant + app regs)     │
                        └─────────┬────────────────┘
                                  │ OIDC / JWT
                                  ▼
  Operator ──HTTPS──▶ Azure Front Door ──▶ Container Apps Env (private VNet)
                                            │
                            ┌───────────────┼───────────────┐
                            ▼               ▼               ▼
                        Web (Next)      API (Fastify)   Worker (BullMQ)
                            │               │               │
                            └───────────────┼───────────────┘
                                            │ Managed Identity
                            ┌───────────────┼───────────────┐
                            ▼               ▼               ▼
                       Key Vault    Postgres Flex      Redis Cache
                                    (private endpoint) (private endpoint)
                                            │
                                            ▼
                                  PulsePoint DSP API
                                  (egress allowlist;
                                   per-host rule via NAT)
```

| Concern | Choice | Why |
|---|---|---|
| Compute | **Azure Container Apps** | Managed K8s-lite, KEDA scaling, revisions, managed identity, cheaper than AKS for our footprint |
| DB | **Azure Database for PostgreSQL Flexible Server** | Private endpoint, automated backups, point-in-time restore |
| Cache/queue | **Azure Cache for Redis** | TLS, private endpoint, BullMQ-compatible |
| Identity | **Microsoft Entra ID** | Org SSO, group→role mapping, conditional access |
| Secrets | **Azure Key Vault** | Managed Identity access; no static creds in app |
| Telemetry | **Azure Monitor + App Insights via OpenTelemetry** | Correlation IDs, distributed traces, log analytics |
| Edge | **Azure Front Door** (or App Gateway WAF) | TLS termination, WAF, DDoS protection |
| IaC | **Bicep** | First-party, ARM-native |

## 4. Trust boundaries

| # | Boundary | Controls |
|---|---|---|
| 1 | Operator ↔ Web | TLS, Entra ID OIDC w/ PKCE, conditional access policies (IT-controlled) |
| 2 | Web ↔ API | TLS, JWT bearer (Entra), CORS allowlist, rate limit |
| 3 | API ↔ Postgres | Private endpoint, password from Key Vault, Prisma parameterized only |
| 4 | API/Worker ↔ Redis | Private endpoint, TLS, ACL user, password from Key Vault |
| 5 | Worker ↔ PulsePoint API | Egress allowlist (per-host), URL/scheme allowlist in code (`_isAllowedEndpoint`), API key from Key Vault, retry w/ jitter, circuit breaker |
| 6 | App ↔ Key Vault | Managed Identity, RBAC roles `Key Vault Secrets User` |
| 7 | Operator ↔ Audit log | Read-only, RBAC `OPS_LEAD`/`ADMIN` only; export endpoint w/ signed URL |

## 5. Data model (high level)

See `packages/api/prisma/schema.prisma` for canonical definitions.

```
Campaign ──┬── Creative
           ├── AudienceList
           ├── IdMapping (AMS ↔ PulsePoint)
           ├── SyncJob (BullMQ shadow)
           ├── ReconciliationRun
           ├── ReportingSnapshot
           └── PacingAlert

User ── AuditLog (entityType, entityId, before, after, actorId)

MetricDefinition  (registry — normalized reporting definitions)
ErrorRunbook      (registry — AMS_SYNC_001, AMS_VAL_002, …)
```

**Key invariants:**
- `Campaign.amsUuid` is immutable and the canonical ID. `pulsepointId` is set after first successful sync and **never** rewritten.
- `IdMapping` rows are append-only relative to `(campaignId, amsField)`; updates create new rows w/ `lastSyncedAt`.
- `AuditLog` is write-only from app code; no `UPDATE`/`DELETE` paths exist.
- `Creative.contentHash` locks creative bytes; transitions to `LOCKED` snapshot the hash for MLR audit.

## 6. Workflow state machines

Defined in `packages/shared/src/states.ts`. Single source of truth for:

- `CampaignState`: `DRAFT → QA → APPROVED → READY_TO_TRAFFIC → SYNCED → LIVE → OPTIMIZING → COMPLETED → ARCHIVED`
- `CreativeState`: `DRAFT → SUBMITTED → MLR_APPROVED → LOCKED → TRAFFICKED → LIVE → RETIRED`

Gates enforced in `services/campaign-workflow.ts`:
- `READY_TO_TRAFFIC` requires `audienceQaAt && budgetQaAt && creativeQaAt && all creatives LOCKED`.

## 7. PulsePoint sync contract (current vs target)

**Current:** stub mode — `PP-STUB-<8-char>` IDs when `PULSEPOINT_API_BASE_URL` / `_API_KEY` absent. Reconciliation uses deterministic fake spend.

**Target (Phase 3):** real REST contract from PulsePoint IT, with:
- HTTPS only, TLS ≥ 1.2
- Bearer auth from Key Vault
- Idempotency-Key header per `SyncJob.id`
- Response schema validation before persist
- Timeout (10s default), retry w/ jittered backoff (max 5), circuit breaker (5 failures → open 60s)

## 8. Observability (Phase 4)

- **Logs:** Pino → stdout → Container Apps log stream → Log Analytics. Structured JSON. Redact known-sensitive keys (`PULSEPOINT_API_KEY`, headers, cookies).
- **Traces:** OpenTelemetry SDK, propagating W3C `traceparent` across Web → API → Worker → Postgres → outbound HTTP.
- **Metrics:** Custom counters/histograms — `ams.sync.attempts`, `ams.recon.delta_pct`, `ams.pacing.alerts.fired`, `ams.audit.events`.
- **Dashboards:** App Insights workbooks for ops, recon health, sync queue depth.
- **Alerts:** Sync failure rate > 1% / 15 min; recon delta > tolerance; queue depth > N.

## 9. CI / CD (Phase 5)

GitHub Actions, OIDC-federated to Azure (no stored creds):

1. `typecheck` (tsc) → `lint` (eslint) → `unit` (vitest) → `e2e-smoke` (playwright)
2. SAST: Semgrep config `auto` + Node-specific rules
3. Supply chain: `npm audit --omit=dev`, Dependabot, Trivy on built image, CycloneDX SBOM
4. Build container (`distroless` or `node:20-alpine` non-root)
5. Push to ACR, deploy to Container Apps revision via Bicep
6. Prisma `migrate deploy` as a job-revision step (not on every API container start)

## 10. Failure modes / blast radius

| Failure | Effect | Mitigation |
|---|---|---|
| PulsePoint API down | Sync jobs go `FAILED` w/ `AMS_SYNC_001`; retried by BullMQ; recon stale | Circuit breaker, runbook visible in UI |
| Postgres failover | API reads/writes pause | Connection pool retry; ACA HTTP probe drains revision |
| Redis outage | New sync enqueues fail | Inline-fallback flag (existing) for dev only; prod alerts on queue health |
| Misconfig env | Container fails fast on Zod env-validation (Phase 1) | Crash-loop visible to IT; no degraded silent state |
| Bad migration | `migrate deploy` step fails CI; revision not promoted | Manual rollback Bicep revision |

---

**Living doc.** Update on every cross-cutting change (auth, DB, queue, deploy target, third-party integration).
