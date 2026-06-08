# Threat Model — PulsePoint AMS

**Last reviewed:** 2026-05-22 · **Methodology:** STRIDE per component, mapped to OWASP Top 10 and OWASP ASVS L2.

This is a living document. Update on every change to trust boundaries (`docs/ARCHITECTURE.md` §4), data classes (`docs/DATA-CLASSIFICATION.md`), or external integrations.

---

## 1. Assets

| # | Asset | Sensitivity | Notes |
|---|---|---|---|
| A1 | Campaign records (budget, flights, status) | Business-confidential | Source of truth for billing and reconciliation |
| A2 | Provider lists (NPI, hospital, prescriber) | Business-confidential, **not PHI** | Provider-level data only; no patient identifiers |
| A3 | Audit log | Business-confidential, integrity-critical | Immutable; supports investigations and compliance |
| A4 | PulsePoint API key | Secret | IT-issued; in Key Vault; never logged |
| A5 | Entra ID tokens | Secret-in-flight | Bearer JWT; verified via JWKS |
| A6 | Reconciliation results | Business-confidential | Drives revenue assurance |
| A7 | DB connection string | Secret | Key Vault; Managed Identity access |

## 2. Actors

| Actor | Trust | Capabilities |
|---|---|---|
| **Operator** (Trafficker, MLR Reviewer, Ops Lead, Admin) | Authenticated via Entra ID | Use Web UI per role |
| **Viewer** | Authenticated, read-only | Read campaigns, audit, recon |
| **Service principal** (Worker → PulsePoint) | App identity | Outbound API calls to PulsePoint |
| **External: PulsePoint DSP** | Trusted-with-bounded-scope | Receives campaign syncs; returns IDs/metrics |
| **External: Anonymous internet** | Untrusted | Should never reach API directly (private VNet + Front Door) |
| **Insider** (developer, ops engineer) | Trusted with controls | Limited prod access via Entra PIM |

## 3. STRIDE per component

### 3a. Web (Next.js)

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| S | Phishing / fake login | Entra ID conditional access; CSP `frame-ancestors 'self'` | Phase 2 |
| T | DOM injection via campaign names | React escapes by default; **never** `dangerouslySetInnerHTML` w/ server data | Enforced |
| R | Lost user actions | Server logs every mutation w/ actor ID | Phase 4 |
| I | Token leak in URL | Auth-code + PKCE flow; tokens in memory only, not URL | Phase 2 |
| D | DoS on public endpoint | Front Door / WAF + ACA scaling cap | Phase 6 |
| E | Privilege escalation in client state | Server re-checks role on every mutation; client role hint is advisory | Enforced |

### 3b. API (Fastify)

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| S | Forged JWT | `@fastify/jwt` w/ JWKS from Entra; verify `iss`, `aud`, `tid`, `exp` | Phase 2 |
| T | SQL injection | Prisma parameterized only; Zod validation on all bodies | Enforced |
| T | Mass assignment | Zod schemas use `.strict()` (Phase 1) | Phase 1 |
| R | Action attributed to wrong actor | `actorPlugin` extracts `oid` from JWT; audit row written in same tx | Phase 2 |
| I | Sensitive data in logs | Pino redact list + Phase 1 audit redaction | Phase 1/4 |
| I | Verbose error leaks stack/SQL | Generic error handler returns code + safe message; details server-side only | **Hardened** (server.ts) |
| D | Unbounded request body | Fastify `bodyLimit` set to 1 MB (Phase 1); rate limit per route | Phase 1 |
| E | RBAC bypass | `assertPermission(actor, perm)` required on every mutating route; reviewed via tests | Phase 7 |
| E | IDOR on `/campaigns/:id` | Authorization check loads + verifies tenant/owner before returning | Phase 2 |

### 3c. Worker / sync to PulsePoint

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| S | Spoofed PulsePoint host | URL allowlist via `_isAllowedEndpoint()`; HTTPS-only outside dev | Phase 3 |
| T | Replay of sync job | `Idempotency-Key: <SyncJob.id>` header; PulsePoint dedupes | Phase 3 |
| T | Tampered DB enqueue | Producer signs `payload` w/ HMAC (optional, evaluate Phase 4) | Future |
| R | Lost retry context | `SyncJob.attempt`, `errorCode`, `errorDetail` persisted | Enforced |
| I | API key in error messages | Redacted before logging | Phase 1 |
| D | PulsePoint outage cascades | Circuit breaker, exponential backoff w/ jitter, DLQ after `maxAttempts` | Phase 3 |
| E | Job picks up wrong actor | Job carries `actorId`; worker uses service identity for outbound, business identity for audit | Phase 3 |

### 3d. Database (Postgres)

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| T | Direct DB write bypassing app rules | Network isolation (private endpoint); read-only role for analytics; no shared admin creds | Phase 6 |
| R | Audit row deletion | App code never `UPDATE`/`DELETE` `AuditLog`; DB role denies it (Phase 6 RLS / GRANT) | Phase 6 |
| I | Secrets at rest | Postgres encryption-at-rest (Azure default); Key Vault for app secrets | Default |
| D | Storage exhaustion | Backups + retention policy; alerts on disk usage | Phase 6 |

### 3e. Redis / queue

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| T | Job queue tampering | Redis ACL user, password, TLS, private endpoint | Phase 6 |
| I | PII in payload | Payloads carry IDs only — never NPI list contents or audit-payload bodies | Enforced (review on every payload addition) |

### 3f. CI / CD

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| T | Malicious dep | `npm ci` only; lockfile required; Dependabot; SBOM diff in PR | Phase 5 |
| S | Stolen deploy creds | OIDC federation to Azure; no long-lived secrets in GH | Phase 5 |
| E | Unsigned images | Push only to ACR w/ scoped token; sign images (Sigstore — TBD) | Phase 5/8 |

## 4. Top current gaps (ordered by risk)

| Risk | Gap | Phase to close |
|---|---|---|
| **High** | No real auth — dev header trusts any caller | Phase 2 |
| **High** | No prod Dockerfile / non-root / distroless | Phase 1 |
| **High** | No CI w/ SAST + dep-scan + image scan | Phase 5 |
| **Medium** | No URL allowlist on PulsePoint client → SSRF risk | Phase 3 |
| **Medium** | No `helmet`/CSP/rate-limit on API or Web | Phase 1 |
| **Medium** | Audit `before`/`after` payloads not redacted yet | Phase 1 |
| **Medium** | No structured tracing / correlation IDs | Phase 4 |
| **Low** | No row-level security in Postgres | Phase 6 |
| **Low** | No image signing | Phase 8 |

## 5. Out-of-band concerns (track w/ IT)

- DLP egress monitoring on PulsePoint host.
- WAF rules for OWASP CRS at Front Door / App Gateway.
- Backup encryption keys (BYOK vs Microsoft-managed).
- Geo restrictions / conditional access on Entra ID.
- Penetration test scope + timing once Phase 5+6 land.

## 6. Review cadence

- On every PR that touches: auth, audit, sync, env validation, DB schema, IaC, dependency manifest.
- Quarterly full re-read regardless of changes.
- Capture findings as numbered entries in `docs/THREAT-MODEL-CHANGELOG.md` (created Phase 8).

---

**See:** `SECURITY.md`, `docs/ARCHITECTURE.md`, `docs/DATA-CLASSIFICATION.md`, `docs/COMPLIANCE-HIPAA.md`.
