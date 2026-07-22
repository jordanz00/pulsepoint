# PulsePoint Enterprise AMS — Optimized Master Prompt

**Use this prompt** when briefing agents, vendors, or IT on the statewide hospital-association AMS. It is tuned to **PulsePoint** (`/Users/jordanzabady/Desktop/pulse`), not a generic AMS rebuild.

---

## Context (one paragraph)

Design and deliver an **enterprise-grade, multi-tenant AMS** for a **statewide hospital and health system association** with 16 operational departments (Executive Office through Evolve). Serve hospitals, health systems, executives, policy staff, workforce leaders, emergency teams, and business partners. Optimize for **advocacy-heavy operations**, **cross-department collaboration**, **MemberPulse engagement**, **healthcare-adjacent compliance** (HIPAA-aware, SOC 2–aligned architecture), and **Azure/Microsoft readiness** without claiming live Entra or warehouse integration until IT approves.

**Default profile:** `INTEGRATION_PROFILE=demo`. **Enterprise profile (future):** `INTEGRATION_PROFILE=hap-azure`.

---

## Department map (implementation anchor)

| Department ID | Name |
|---------------|------|
| `executive_office` | Executive Office |
| `accounting` | Accounting |
| `advocacy` | Advocacy |
| `business_development` | Business Development & Operations |
| `communications` | Communications and Public Affairs |
| `education` | Education |
| `emergency_management` | Emergency Management |
| `finance_legal` | Finance & Legal Affairs |
| `human_resources` | Human Resource Services |
| `information_technology` | Information & Technology Services |
| `member_services` | Member Services & Strategic Initiatives |
| `policy` | Policy |
| `quality_initiatives` | Quality Initiatives |
| `strategic_analytics` | Strategic Analytics |
| `workforce_clinical` | Workforce & Clinical Affairs |
| `hapevolve` | Evolve |

**Code:** `lib/association/departments.ts` · **UI:** `/[orgSlug]/enterprise`

---

## Requirements → PulsePoint modules (phased)

| # | Requirement area | PulsePoint phase | Primary code |
|---|------------------|------------------|--------------|
| 1 | Membership & CRM | **Live** + foundation | `members`, `crm`, `MemberOrganization`, `MemberPulse`, `Committee` |
| 2 | Advocacy & GA | **Foundation** | `AdvocacyIssue`, `AdvocacyCampaign`, `engage`, `crm` |
| 3 | Education & workforce | **Alpha** | `learn`, `events` |
| 4 | Emergency management | **Foundation** | `EmergencyContact`, `EmergencyReadinessReport` |
| 5 | Communications | **Alpha** | `engage`, `members` |
| 6 | Strategic analytics | **Alpha** | `insights`, `members/pulse`, `continuity:export` |
| 7 | Finance & accounting | **Roadmap** | `commerce`; NetSuite/QB via integrations |
| 8 | Events & conferences | **Live** | `events`, sessions, speakers, sponsors |
| 9 | Workforce & clinical | **Foundation** | `learn`, `MemberRole`, workforce dept |
| 10 | Security & governance | **Foundation** | `lib/permissions.ts`, `AuditLog`, `docs/BACKUP-REQUIREMENTS.md` |
| 11 | Integrations | **Foundation** | `IntegrationConnection`, `lib/association/integrations.ts` |
| 12 | Automation & AI | **Foundation** | `CrmWorkflow`, `MemberPulse`; AI **roadmap** |
| 13 | Technical architecture | **Live** | Next.js 16, Prisma, multi-tenant `orgId`, adapters |
| 14 | User personas | **Foundation** | `lib/association/personas.ts` |

**Full matrix:** `lib/association/modules.ts` · **Architecture:** `docs/ENTERPRISE-ARCHITECTURE.md`

---

## Non-negotiables for every agent

1. **Tenant scope:** All queries via `getOrgDb(orgId)`; never cross-org reads.
2. **Permissions:** `requireCapability()` on every server mutation — see extended capabilities in `lib/permissions.ts`.
3. **Backups:** **Required** before schema migrations — `pnpm continuity:backup`; see `docs/BACKUP-REQUIREMENTS.md`.
4. **No invented healthcare stats** in advocacy or quality copy — cite sources or flag SME review.
5. **Honest status:** `live` / `alpha` / `foundation` / `roadmap` — do not market roadmap as GA.
6. **Azure:** Document swaps in `docs/ENTERPRISE-INTEGRATION.md`; do not hardcode secrets or fake Entra.

---

## Deliverables checklist (section 15)

| Deliverable | Location |
|-------------|----------|
| Architecture | `docs/ENTERPRISE-ARCHITECTURE.md` |
| Domain model / schema | `prisma/schema.prisma` + `docs/DATA-DICTIONARY.md` |
| Module breakdown | `lib/association/modules.ts`, `lib/products.ts` |
| RBAC model | `lib/permissions.ts`, `lib/association/rbac-matrix.ts` |
| Integration strategy | `lib/association/integrations.ts`, `docs/ENTERPRISE-INTEGRATION.md` |
| Backup / continuity | `docs/BACKUP-REQUIREMENTS.md`, `scripts/continuity/` |
| Personas & journeys | `lib/association/personas.ts` |
| Sample dashboards | `/enterprise`, `/members/pulse`, `/insights` |
| Multi-year plan | `docs/REALIZATION-PLAN.md` |
| Risks | `docs/AMS-PLATFORM-RISKS-AND-MITIGATIONS.md` |

---

## Optimized agent instruction (copy-paste)

```
You are building PulsePoint AMS for a statewide hospital association.
Repo: /Users/jordanzabady/Desktop/pulse
Departments: lib/association/departments.ts (16 depts)
Enforce: getOrgDb(orgId), requireCapability, continuity:backup before migrations
Member center: MemberPulse (lib/member-pulse/) on members + /members/pulse
Enterprise hub: /[orgSlug]/enterprise
Phase work per lib/association/modules.ts — do not claim GA for roadmap items
Azure: swap map only until INTEGRATION_PROFILE=hap-azure approved
Warehouse: pnpm continuity:export — no live Gold DB yet
```
