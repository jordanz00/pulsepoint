# Data Classification — PulsePoint AMS

**Last reviewed:** 2026-05-22 · **Owner:** TBD on IT hand-off (`CODEOWNERS`).

This document defines what data PulsePoint AMS handles, how it is classified, and the controls applied per class. It is the contract referenced by `SECURITY.md`, `docs/THREAT-MODEL.md`, and `docs/COMPLIANCE-HIPAA.md`.

---

## 1. Classification scheme

| Class | Definition | Examples in this app |
|---|---|---|
| **Public** | Intended for unrestricted disclosure | Marketing copy, public docs |
| **Internal** | Default for non-sensitive operational data | Campaign names, flight dates, status |
| **Confidential** | Business-sensitive; restricted to authorized roles | NPI lists, budget figures, audit log, recon results |
| **Secret** | Credentials, tokens, keys | PulsePoint API key, DB passwords, Entra client secrets |
| **PHI / PII (regulated)** | Health information protected by HIPAA / state laws | **Not handled by this system.** See §4. |

## 2. Data inventory

| Data element | Source | Class | Where stored | Rendered to | Logged? |
|---|---|---|---|---|---|
| Campaign name, client name, budget, flight, status | Operator input | Internal/Confidential | `Campaign` | Web UI, audit | ID + name only |
| Creative metadata (`name`, `version`, `contentHash`) | Operator input | Internal | `Creative` | Web UI, audit | ID only |
| **NPI list (provider 10-digit IDs)** | Operator upload | **Confidential** | `AudienceList.validationReport` (counts/flags), file storage TBD per IT | Counts and validation report only; raw lines never re-rendered | **No raw NPIs in logs**. Counts only. |
| Hospital name, prescriber name (if attached) | Operator/ETL | Confidential | TBD per IT data agreement | Web UI (role-gated) | No |
| `IdMapping` (AMS UUID ↔ PulsePoint ID) | System | Internal | `IdMapping` | Web UI | IDs only |
| Sync job payload | System | Internal | `SyncJob.payload` | Operators (Ops Lead+) | Redacted (Phase 1) |
| Audit `before`/`after` JSON | System | Confidential | `AuditLog` | Operators (Ops Lead+) | Redact list (Phase 1) |
| Reconciliation values (spend, impressions) | System + PulsePoint | Confidential | `ReconciliationRun`, `ReportingSnapshot` | Web UI | Aggregates only |
| Pacing alerts | System | Internal | `PacingAlert` | Web UI | Yes |
| User identity (email, name, role) | Entra ID claims | Internal | `User` | Web UI (admin) | Email may appear in audit `actor` |
| **PulsePoint API key** | IT (Key Vault) | **Secret** | Key Vault | Never | **Never** |
| **DB / Redis / Entra secrets** | IT (Key Vault) | **Secret** | Key Vault | Never | **Never** |

## 3. Handling rules (by class)

| Rule | Internal | Confidential | Secret |
|---|---|---|---|
| Encryption at rest | DB default | DB default + audit log table | Key Vault HSM-backed |
| Encryption in transit | TLS | TLS | TLS only; never console |
| Logging | OK (structured) | IDs and aggregates only; redact bodies | **Forbidden** |
| Display in UI | Role-gated | Role-gated; export requires audit log entry | **Never** |
| Backup | Standard DB backups | Standard + retention 7y | Vault rotation policy (90d max) |
| Export | API + audit | API + audit; signed URL (Phase 8) | N/A |

## 4. PHI / PII statement

**PulsePoint AMS does not ingest, process, store, or render PHI as defined by 45 CFR §160.103.**

- Provider data (NPI, prescriber name, hospital name) identifies *providers*, not patients, and is not PHI on its own.
- We handle no patient identifiers, claims, diagnoses, prescriptions, lab results, or visit records.
- We do not receive event-level pixel data or user-level identifiers from the DSP.

If product scope ever expands to ingest patient-linked data, this document and `docs/COMPLIANCE-HIPAA.md` must be revised, a Business Associate Agreement (BAA) must be in place with affected counterparties, and the threat model re-validated.

## 5. Retention

| Class | Default retention | Mechanism |
|---|---|---|
| Operational records (Campaign, Creative, etc.) | Lifetime of program + 3y | Soft-delete via `state = ARCHIVED`; physical purge per IT policy |
| `AuditLog` | **7 years** | Immutable rows; archival to cold storage (Phase 8) |
| `SyncJob` payloads | 90 days | Scheduled purge (Phase 8) |
| `ReportingSnapshot`, `ReconciliationRun` | 7 years | Same retention as audit log |
| Logs / traces | 90 days hot, 1y cold | Log Analytics retention setting (Phase 6) |
| Secrets | 90 days max | Key Vault rotation policy |

## 6. Access matrix (target — Phase 2)

| Role | Campaigns | Creatives | NPI lists | Audit log | Recon | Sync ops | Admin |
|---|---|---|---|---|---|---|---|
| `VIEWER` | R | R | — | — | R | — | — |
| `TRAFFICKER` | R/W (own) | R/W | R/W | — | R | — | — |
| `MLR_REVIEWER` | R | R/Approve | R | R | R | — | — |
| `OPS_LEAD` | R/W | R/W | R/W | R | R/W | R/W | — |
| `ADMIN` | R/W | R/W | R/W | R | R/W | R/W | R/W |

Mapped to permissions in `packages/shared/src/roles.ts`. Enforced via `assertPermission()` on every mutating route.

## 7. Audit log redaction (Phase 1 — pending)

The `AuditLog.before` / `AuditLog.after` JSON snapshots **must** strip the following keys before persist:

```
authorization, cookie, set-cookie, x-ams-user-email,
pulsepoint_api_key, jwt_secret, password, secret, token,
ssn, dob, phone, email_personal
```

Implementation target: helper in `packages/api/src/lib/audit.ts` (`redactForAudit(obj)`) called by every audit emitter. Test fixtures must include a row containing each banned key to prove redaction works.

## 8. Egress data flows

| Destination | Data | Class | Authorization |
|---|---|---|---|
| **PulsePoint DSP API** | Campaign payload (name, budget, flights, creative tag IDs) | Internal/Confidential | Bearer token from Key Vault |
| **Azure Monitor / App Insights** | Telemetry (no payloads) | Internal | Managed Identity |
| **Operator browser** | Per-role views via API; no NPI list raw bytes after upload | Confidential | Entra JWT |

No third-party trackers. No analytics SDKs. No CDNs serving user-facing scripts in production paths beyond Azure-hosted assets.

---

**See:** `SECURITY.md` §3, `docs/COMPLIANCE-HIPAA.md`, `docs/THREAT-MODEL.md` §3.
