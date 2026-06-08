# Security — PulsePoint AMS

**Last reviewed:** 2026-05-22
**Status:** v0.1 — pre-IT review. This document is the authoritative security posture statement for the PulsePoint AMS project until superseded.

---

## 1. Reporting a vulnerability

- **Do not** open a public GitHub issue for suspected security problems.
- Email the project owner (TBD on hand-off; see `CODEOWNERS`) with:
  - affected component, version / commit SHA, reproduction steps, observed vs expected behavior, severity estimate.
- Acknowledgement target: 2 business days. Triage target: 5 business days.
- Coordinated disclosure preferred; we will credit researchers on request.

## 2. Scope

| In scope | Out of scope |
|---|---|
| API (`packages/api`), Worker (`packages/worker`), Web (`packages/web`), Shared (`packages/shared`), Prisma schema, Docker/Bicep IaC once published | PulsePoint DSP itself, third-party SaaS not under our control, social engineering, physical attacks on IT facilities |

## 3. Data handling — quick statement

- **Provider data (NPI, hospital, prescriber):** treated as **business-confidential**, not PHI. Stored in Postgres; never logged in cleartext beyond entity IDs.
- **No PHI** is ingested, processed, stored, or rendered by this system. See `docs/DATA-CLASSIFICATION.md`.
- **Audit log** stores `before` / `after` JSON snapshots of business entities only. Code path enforces a deny-list for known PII fields (see `packages/api/src/lib/audit.ts` once Phase 1 redaction is in).

## 4. OWASP Top 10 (2021) — current coverage

| ID | Category | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | **Partial** | RBAC roles defined (`packages/shared/src/roles.ts`); dev header auth replaces SSO. Phase 2: Entra ID JWT + per-route policy. |
| A02 | Cryptographic Failures | **Pending** | TLS terminated by Azure Container Apps in prod; Postgres + Redis use managed-service TLS. No app-level encryption at rest yet beyond DB defaults. |
| A03 | Injection | **Mitigated** | Prisma parameterized queries only; Zod input validation on every route. No raw SQL. |
| A04 | Insecure Design | **In progress** | Threat model in `docs/THREAT-MODEL.md`. State machines enforce workflow gates. |
| A05 | Security Misconfiguration | **Pending** | Phase 1: `@fastify/helmet`, CSP on Next, env validation w/ Zod, prod Dockerfile w/ non-root. |
| A06 | Vulnerable / Outdated Components | **Pending** | Phase 5: GH Actions w/ `npm audit`, Dependabot, Trivy on images, SBOM (CycloneDX). |
| A07 | Identification & Authentication | **Pending** | Dev header today. Phase 2: Microsoft Entra ID OIDC (MSAL) + JWT/JWKS verify. |
| A08 | Software & Data Integrity | **Pending** | Phase 5: pinned `package-lock.json`, signed container images, GH Actions OIDC to Azure (no static creds). |
| A09 | Security Logging & Monitoring | **Pending** | Phase 4: OpenTelemetry → App Insights, correlation IDs, audit log dashboard, alert routing. |
| A10 | Server-Side Request Forgery | **Partial** | `pulsepoint-client.ts` uses env-supplied base URL only. Phase 3: scheme/host allowlist (`_isAllowedEndpoint`), timeout, circuit breaker. |

## 5. Secrets policy

- **Never** commit secrets. `.env` is in `.gitignore`; `.env.example` ships placeholders only.
- Local dev uses Compose-managed Postgres/Redis with documented dev-only credentials.
- Production secrets live in **Azure Key Vault**; runtime access via **Managed Identity** assigned to Container Apps. No long-lived keys in app config.
- IT provides `PULSEPOINT_API_KEY`, Postgres connection string, Redis connection string, Entra app registrations.

## 6. Dependency policy

- Lockfile committed (`package-lock.json`) and required for reproducible builds.
- Direct deps reviewed before addition; prefer well-maintained, typed packages.
- Phase 5 enforces: `npm audit --omit=dev` in CI must pass; Dependabot weekly PRs; Trivy scan on container images.

## 7. Coding rules (enforced or pending enforcement)

- **No** `eval`, `Function()`, `child_process.exec` w/ user input.
- **No** unparameterized SQL anywhere (Prisma only).
- **No** `innerHTML` / `dangerouslySetInnerHTML` w/ user-derived strings.
- **All** external `fetch` URLs must pass `_isAllowedEndpoint()` (Phase 3).
- **All** route bodies validated by Zod w/ explicit length / type bounds.
- **All** routes that mutate state require `assertPermission(actor, ...)` from `packages/api/src/lib/auth-context.ts`.

## 8. Supply chain

- Container base images: distroless or `node:20-alpine` w/ non-root user (Phase 1).
- SBOM published per release (Phase 5, CycloneDX format).
- Image signing target: Sigstore / Notary v2 (TBD with IT).

## 9. Incident response

See `docs/INCIDENT-RESPONSE.md` (Phase 8). Until then, default: containment via revoking PulsePoint API key + rotating Entra client secret, isolating affected Container App revision, preserving Postgres + audit log snapshots.

## 10. Audit & retention

- `AuditLog` rows are immutable (no `UPDATE` paths in code).
- Retention: 7 years (HIPAA-aligned). Implementation: scheduled archival to cold storage (Phase 8).
- Export endpoint with signed URL (Phase 8) so IT/auditor can pull without DB access.

---

**See also:**
- `docs/ARCHITECTURE.md`
- `docs/THREAT-MODEL.md`
- `docs/DATA-CLASSIFICATION.md`
- `docs/COMPLIANCE-HIPAA.md`
- `docs/IT-HANDOFF.md`
