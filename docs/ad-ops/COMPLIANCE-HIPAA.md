# Compliance — HIPAA-Aligned Posture

**Last reviewed:** 2026-05-22 · **Stance:** PulsePoint AMS does not handle PHI. We design to a HIPAA-aligned posture so the platform stays defensible if scope changes and so IT can integrate it without exception.

This document is **not** a substitute for legal review or a formal HIPAA risk analysis. It is a control mapping that lets IT and audit verify what we built and where the gaps remain.

---

## 1. Stance

- **Covered Entity / Business Associate?** Today: **neither**, because no PHI is handled (see `docs/DATA-CLASSIFICATION.md` §4).
- **Why HIPAA-aligned anyway?** Healthcare advertising operations are adjacent to regulated data; provider-level data and the people who handle it benefit from the same control rigor. A future product expansion into patient-linked data should require *configuration*, not re-architecture.
- **BAA:** Not required today. If PHI ever flows in, BAAs must be in place with: PulsePoint DSP, Microsoft Azure (the standard Microsoft BAA covers in-scope services), and any sub-processors.

## 2. Microsoft Azure HIPAA-eligible services (target)

Selected services (per Microsoft public list of HIPAA/HITECH-eligible services under the Microsoft BAA):

- Azure Container Apps
- Azure Database for PostgreSQL Flexible Server
- Azure Cache for Redis
- Azure Key Vault
- Azure Monitor (Log Analytics, Application Insights)
- Azure Front Door / Application Gateway
- Azure Container Registry
- Microsoft Entra ID

IT to confirm current eligibility list against Microsoft’s services-in-scope page at hand-off time.

## 3. HIPAA Security Rule control mapping (45 CFR §§164.308–312)

### 3a. Administrative Safeguards (§164.308)

| Standard | Required (R) / Addressable (A) | Implementation in this app | Status |
|---|---|---|---|
| Security Management Process — Risk Analysis (a)(1)(ii)(A) | R | `docs/THREAT-MODEL.md`; quarterly review cadence | **Doc** |
| Risk Management (a)(1)(ii)(B) | R | Phased plan in `README.md` and `docs/ARCHITECTURE.md`; risk-ranked gap list in threat model §4 | **Doc** |
| Sanction Policy (a)(1)(ii)(C) | R | Owned by IT/HR; this app enforces RBAC + audit log | IT |
| Information System Activity Review (a)(1)(ii)(D) | R | `AuditLog`; App Insights workbook (Phase 4) | **Phase 4** |
| Assigned Security Responsibility (a)(2) | R | `CODEOWNERS` (Phase 0) | **Phase 0** |
| Workforce Security (a)(3) | R | Entra ID groups + role mapping (Phase 2) | **Phase 2** |
| Information Access Management (a)(4) | R | RBAC roles in `packages/shared/src/roles.ts`; `assertPermission()` enforced | **Partial** |
| Security Awareness & Training (a)(5) | A | IT-owned program | IT |
| Security Incident Procedures (a)(6) | R | `docs/INCIDENT-RESPONSE.md` (Phase 8) | **Phase 8** |
| Contingency Plan (a)(7) | R | Postgres PITR backups; ACA revisions; disaster-recovery doc (Phase 8) | **Phase 8** |
| Evaluation (a)(8) | R | Quarterly threat-model review; pen test post-Phase 6 | Planned |
| BAA w/ business associates (b) | R | Microsoft BAA (default); PulsePoint BAA only if PHI scope added | IT |

### 3b. Physical Safeguards (§164.310)

All physical controls inherited from Microsoft Azure data centers and the operator workstation policy. No on-prem footprint for this app.

### 3c. Technical Safeguards (§164.312)

| Standard | R/A | Implementation | Status |
|---|---|---|---|
| Access Control — Unique User Identification (a)(2)(i) | R | Entra ID `oid` per user; `User.id` joined to `actorId` | **Phase 2** |
| Emergency Access Procedure (a)(2)(ii) | R | Entra PIM break-glass account (IT-owned) | IT |
| Automatic Logoff (a)(2)(iii) | A | Entra session lifetime + Web idle timeout (Phase 2) | **Phase 2** |
| Encryption / Decryption (a)(2)(iv) | A | TLS in transit; Azure-managed encryption at rest; Key Vault for app secrets | **Default** |
| Audit Controls (b) | R | `AuditLog` table; immutable rows; redaction (Phase 1) | **Partial** |
| Integrity — Mechanism to Authenticate ePHI (c)(2) | A | `Creative.contentHash`; audit before/after JSON; DB integrity constraints | **Partial** |
| Person or Entity Authentication (d) | R | Entra ID OIDC + JWT verify (Phase 2) | **Phase 2** |
| Transmission Security — Integrity Controls (e)(2)(i) | A | TLS 1.2+; HSTS at edge; HMAC consideration for sync payloads (future) | **Phase 1** |
| Transmission Security — Encryption (e)(2)(ii) | A | TLS only; no plaintext channels | **Default** |

## 4. HITRUST / SOC 2 alignment notes (informational)

We are not pursuing HITRUST or SOC 2 certification at the project level. However:

- Audit log + retention design supports SOC 2 CC7 (System Operations) and CC8 (Change Management).
- CI/CD with SAST, dep scan, image scan, and signed deploys (Phase 5) supports CC8.
- Threat model + access reviews support CC6 (Logical & Physical Access).

If the org pursues SOC 2 Type II or HITRUST, this document is the source for control evidence specific to PulsePoint AMS.

## 5. Audit evidence checklist (what to show an auditor)

| Evidence | Where |
|---|---|
| Risk analysis | `docs/THREAT-MODEL.md` |
| Data classification | `docs/DATA-CLASSIFICATION.md` |
| Architecture / trust boundaries | `docs/ARCHITECTURE.md` §4 |
| Access control implementation | `packages/shared/src/roles.ts`, `packages/api/src/lib/auth-context.ts` |
| Audit log implementation | `packages/api/src/lib/audit.ts`, `prisma/schema.prisma` (`AuditLog`) |
| Workflow gates / change control | `packages/shared/src/states.ts`, `packages/api/src/services/campaign-workflow.ts` |
| Logging + monitoring | App Insights workbook + alerts (Phase 4) |
| CI/CD gates | `.github/workflows/*` (Phase 5), `SECURITY.md` §6–§7 |
| Backup / DR | Azure Postgres backup config (IaC, Phase 6); `docs/INCIDENT-RESPONSE.md` (Phase 8) |
| Secrets management | Key Vault references; Bicep IaC (Phase 6) |

## 6. Open items for IT to confirm

1. Microsoft BAA in place for the subscription used to host PulsePoint AMS.
2. Subscription is enrolled in HIPAA-eligible service tier.
3. Log Analytics retention configured to ≥ 1 year (cold).
4. Key Vault access policies / RBAC scoped to Managed Identity only.
5. Postgres / Redis private endpoints provisioned; no public access enabled.
6. Front Door / WAF rules deployed before public DNS cutover.
7. Conditional Access policies on Entra app registrations (MFA, geo, device compliance).

---

**Authoritative source list:** 45 CFR Parts 160, 162, 164. Microsoft Azure Trust Center HIPAA documentation. NIST SP 800-66 r2 (Implementing the HIPAA Security Rule). OWASP ASVS L2.

**See:** `SECURITY.md`, `docs/DATA-CLASSIFICATION.md`, `docs/THREAT-MODEL.md`, `docs/IT-HANDOFF.md`.
