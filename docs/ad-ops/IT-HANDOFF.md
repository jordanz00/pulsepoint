# IT Hand-off — PulsePoint AMS

**Last reviewed:** 2026-05-22 · **Audience:** Internal IT, security, network, and identity teams responsible for hosting and integrating PulsePoint AMS.

This is the single document IT should read to evaluate, provision, and integrate PulsePoint AMS. It points back into the codebase and other docs rather than duplicating them.

---

## 1. What this app is, in one paragraph

PulsePoint AMS is the **system of record** for healthcare advertising operations: campaigns, compliance gates (audience / budget / creative QA, MLR approval), reconciliation against the PulsePoint DSP, sync queueing, audit logging, NPI validation, and pacing alerts. The PulsePoint DSP itself remains the execution layer — this app does not replace it. The product positioning is "trust and fewer handoffs," not feature count vs. competitors.

## 2. Components to host

| Service | Container | Public? | Notes |
|---|---|---|---|
| Web (Next.js) | `pulsepoint-ams-web` | **Yes**, behind Front Door / WAF | Operator UI |
| API (Fastify) | `pulsepoint-ams-api` | No (private) | Called by Web only |
| Worker (BullMQ) | `pulsepoint-ams-worker` | No (private) | Polls Redis; outbound to PulsePoint API |
| Postgres 16 | `Azure Database for PostgreSQL Flexible Server` | No (private endpoint) | Single DB |
| Redis 7 | `Azure Cache for Redis` | No (private endpoint) | BullMQ broker |

See `docs/ARCHITECTURE.md` §3 for diagram.

## 3. Microsoft Entra ID (Azure AD) — app registrations

**Two app registrations required:**

### 3a. API app registration (`pulsepoint-ams-api`)

| Field | Value |
|---|---|
| Sign-in audience | Single tenant |
| Application ID URI | e.g. `api://pulsepoint-ams-<env>` |
| Exposed scopes | `access_as_user` |
| App roles | `Viewer`, `Trafficker`, `MlrReviewer`, `OpsLead`, `Admin` (map 1:1 to `UserRole` enum) |
| Token version | v2 |

### 3b. Web SPA app registration (`pulsepoint-ams-web`)

| Field | Value |
|---|---|
| Sign-in audience | Single tenant |
| Platform | SPA (PKCE) |
| Redirect URIs | `https://<env-host>/auth/callback` |
| API permissions | `pulsepoint-ams-api/.access_as_user` |
| Implicit / hybrid | Disabled (auth-code + PKCE only) |

### 3c. Group → role mapping

Recommended Entra security groups (IT may align names to org standard):

| Entra group | App role |
|---|---|
| `pulsepoint-ams-viewers` | `Viewer` |
| `pulsepoint-ams-traffickers` | `Trafficker` |
| `pulsepoint-ams-mlr` | `MlrReviewer` |
| `pulsepoint-ams-ops` | `OpsLead` |
| `pulsepoint-ams-admins` | `Admin` |

Conditional Access:

- MFA required for all groups.
- Compliant device policy for `OpsLead`, `Admin`.
- Geo restriction to org-permitted countries.

## 4. Azure Key Vault — secrets needed

| Secret name | Source | Consumer |
|---|---|---|
| `pulsepoint-api-key` | PulsePoint DSP team | API + Worker |
| `postgres-connection-string` | Azure Postgres provisioning | API + Worker |
| `redis-connection-string` | Azure Redis provisioning | API + Worker |
| `appinsights-connection-string` | App Insights resource | All |
| `pulsepoint-api-base-url` | PulsePoint DSP team | API + Worker (URL only; non-secret but co-located for rotation) |

Access: Container Apps **Managed Identity** assigned `Key Vault Secrets User` on the vault. No static keys in app config. Rotation: 90 days max. PulsePoint API key rotated on issuance from DSP team.

## 5. Networking

| Need | Recommendation |
|---|---|
| Inbound to Web | Azure Front Door (or App Gateway) w/ WAF (OWASP CRS), TLS 1.2+, HSTS preload |
| Container Apps env | Internal-only; private VNet; ingress to Web via Front Door private link |
| Postgres | Private endpoint, no public access, firewall denies all |
| Redis | Private endpoint, TLS, ACL user |
| Outbound to PulsePoint API | Egress allowlist (per host); recommend NAT gateway for stable egress IPs |
| Outbound to Microsoft endpoints | Service tags (AzureKeyVault, AzureMonitor, AzureActiveDirectory) |

## 6. Configuration the app expects (env vars)

See `.env.example`. Production values come from Key Vault references; do not set values in container env directly except non-secret URLs / IDs.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Y | Key Vault ref |
| `REDIS_URL` | Y | Key Vault ref |
| `PULSEPOINT_API_BASE_URL` | Y (prod) | HTTPS only |
| `PULSEPOINT_API_KEY` | Y (prod) | Key Vault ref |
| `ENTRA_TENANT_ID` | Y | Public |
| `ENTRA_API_AUDIENCE` | Y | API app reg "Application ID URI" |
| `ENTRA_API_CLIENT_ID` | Y | API app reg client ID |
| `ENTRA_WEB_CLIENT_ID` | Y | Web SPA client ID |
| `AMS_DEV_AUTH_ALLOW_HEADER` | N | Must be `false` or unset in production (Phase 1 enforces) |
| `OTEL_SERVICE_NAME` | Y | Per-service |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Y | Key Vault ref |
| `NODE_ENV` | Y | `production` |
| `LOG_LEVEL` | N | Defaults to `info` |

## 7. Database

- **Engine:** PostgreSQL 16 (Flexible Server).
- **Sizing (initial):** GP burstable, 2 vCore / 8 GB; scale to GP standard once usage measured.
- **Backups:** automated, geo-redundant, ≥ 7 day point-in-time restore.
- **Connections:** pooler enabled; app connection limit set ≤ instance limit minus admin headroom.
- **Migrations:** `prisma migrate deploy` runs as a separate job-revision in Container Apps before promoting API revision (Phase 5/6).

## 8. Container images

- **Registry:** Azure Container Registry, scoped tokens, image scanning enabled.
- **Base image:** `node:20-alpine` non-root (target: `gcr.io/distroless/nodejs20` for API/Worker) — finalized Phase 1.
- **SBOM:** CycloneDX uploaded as build artifact (Phase 5).
- **Image scan:** Trivy in CI; ACR’s built-in scan also enabled.
- **Signing:** Sigstore / Notary v2 (target — TBD with IT, Phase 8).

## 9. Observability

- **Logs:** stdout JSON (Pino) → Container Apps log stream → Log Analytics workspace.
- **Traces / metrics:** OpenTelemetry SDK → Application Insights.
- **Correlation:** W3C `traceparent` propagated Web → API → Worker.
- **Dashboards / alerts:** App Insights workbooks for ops, sync queue depth, recon delta, audit volume; alerts on sync failure rate, queue depth, error budget burn.

## 10. Egress / data flow to PulsePoint DSP

| Item | Value |
|---|---|
| Direction | Outbound only |
| Protocol | HTTPS (TLS 1.2+) |
| Auth | Bearer token from Key Vault |
| Idempotency | `Idempotency-Key: <SyncJob.id>` (Phase 3) |
| Retry | Exponential backoff w/ jitter, max 5 attempts (configurable); circuit breaker after 5 consecutive failures (60s open) |
| Data sent | Campaign metadata, creative tag IDs — see `pulsepoint-client.ts` `PulsePointCampaignPayload` |
| Data received | PulsePoint campaign ID, raw response (validated by schema before persist) |

Confirm contract with DSP team before Phase 3 implementation. The current client is a documented stub.

## 11. Provisioning checklist (IT runbook target)

Once Phase 6 IaC ships, this becomes a one-shot:

1. Subscription / resource group provisioned (HIPAA-eligible tier).
2. Microsoft BAA confirmed for subscription.
3. VNet, subnets, private DNS zones created.
4. Key Vault provisioned; secrets seeded (§4).
5. Postgres Flex + Redis Cache provisioned w/ private endpoints.
6. Container Apps environment provisioned in VNet.
7. ACR provisioned; image push pipeline wired (GH OIDC).
8. Entra app registrations created (§3); group → role mappings configured.
9. Front Door + WAF configured w/ OWASP CRS.
10. Log Analytics workspace + App Insights connected to Container Apps.
11. DNS cutover.
12. Smoke tests (Playwright) run from outside the VNet against public URL; manual auth check w/ test users from each Entra group.
13. Pen test scheduled.

## 12. Open questions for IT

| # | Question |
|---|---|
| 1 | Subscription / management group to host this workload? |
| 2 | Region(s) — primary + DR? |
| 3 | DNS naming convention for `<env>.<service>.<org>` hosts? |
| 4 | Existing Key Vault reuse vs new vault per workload? |
| 5 | Existing Log Analytics workspace reuse vs new? |
| 6 | Front Door vs App Gateway WAF — org standard? |
| 7 | OIDC federation from GitHub already configured for the subscription? |
| 8 | NAT gateway availability for stable egress IPs to PulsePoint? |
| 9 | Conditional Access baselines we must inherit? |
| 10 | Pen test cadence — internal team or third party? |

## 13. References

- `README.md` — quick start, what's implemented (v0.1), philosophy
- `SECURITY.md` — reporting, OWASP coverage, secrets policy
- `docs/ARCHITECTURE.md` — components, topology, trust boundaries
- `docs/THREAT-MODEL.md` — STRIDE per component, top gaps
- `docs/DATA-CLASSIFICATION.md` — what data flows where
- `docs/COMPLIANCE-HIPAA.md` — control mapping
