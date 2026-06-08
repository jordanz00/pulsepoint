# PulsePoint — Project brief for leadership

**Audience:** Executive staff, board, grants, IT partners  
**Purpose:** State what this project is building, how it helps the organization, and what “done” means—without overselling roadmap modules.

---

## What this project is

**PulsePoint** is a modern **association management system (AMS)** built for **healthcare member-based organizations**. It replaces reliance on legacy AMS contracts (e.g. Protech-scale cost and timelines) with a **modular platform** the organization owns and operates.

This is **not** a weekend CRM or a demo homepage. It is a **foundation-first** product: multi-tenant by design, audited actions, controlled exports, staged data migration, and honest public positioning (Live vs Roadmap).

**What we sell:** not “Members” or “Events” as boxes—the product is **operational trust**: predictable behavior under association workflows (imports, money, permissions, exceptions, audit). See [REALIZATION-PLAN.md](./REALIZATION-PLAN.md).

**PII only — not a PHI platform.** Member contact data, event registration, and payments are in scope. Clinical or HIPAA workloads are explicitly out of scope so the association does not accidentally become a regulated health data platform.

---

## How it helps the organization

| Organizational need | How PulsePoint addresses it |
|---------------------|----------------------------|
| **Cost of legacy AMS** | Own the core wedge (members + events) without million-dollar lock-in for every module upfront |
| **Staff productivity** | One directory, staff notes (not spreadsheets), event registration and check-in in one admin experience |
| **Member trust** | Company A never sees Company B’s data; exports and deletes require real roles, not UI-only checks |
| **Revenue integrity** | Paid event registration tied to Stripe with idempotent webhooks and documented replay when systems disagree |
| **Cutover risk** | Member imports are **staged and reviewed** before they become production records—not blind CSV upload |
| **Grant and board credibility** | Marketing and decks align with **Live vs Roadmap** so leadership does not claim Commerce, Insights, or Learn before they ship |
| **Peak-season support** | Runbooks and an **exceptions queue** so partial failures (e.g. email) are triaged—not silent or mysterious |

**ROI framing (no fantasy math):** Value comes from **exit cost**, **staff time**, and **fewer data/payment mistakes**. One serious incident—a cross-tenant leak, double charge, or bad import—can erase years of savings. This project invests in **preventing that class of failure**, not only in faster screens.

---

## What we are working on now (narrow wedge)

We are **not** rebuilding twenty years of legacy AMS edge cases in one release. We are finishing a **shippable wedge** and the unglamorous layer underneath it.

### Live focus (v0.1)

| Module | What staff and members get |
|--------|----------------------------|
| **MemberCore** | Member directory, tags, staff notes, ADMIN-gated CSV export, **staged import** (upload → review → apply) |
| **PulsePoint Events** | Event setup, public registration, capacity/waitlist, Stripe checkout when configured, check-in, registration status rules |
| **PulsePoint Work** | Admin shell per organization, role-based access, **automation exceptions** for staff triage |
| **Honest migration** | Documented subprocessors, privacy/subprocessor registry, runbooks for payment and import issues |

### Roadmap (intentionally not claimed as shipped)

PulsePoint Learn, Giving, Commerce, Engage, and Insights appear in **product narrative and marketing** with honest **Live / Roadmap** labels until each module reaches GA. Automated renewals, full SSO, Power BI embed, and full GDPR automation are **not** v0.1.

**One sentence for grants and boards:**

> PulsePoint ships **MemberCore** and **PulsePoint Events** today; additional modules are on the roadmap with clear Live/Roadmap labeling—not implied by the homepage alone.

---

## What you’re already doing right (use this politically)

This build is **not** vibe-coding blind. The following are in place **from day one**—uncommon in fast prototype CRM experiments:

| Foundation | Why it matters to the org |
|------------|---------------------------|
| **Multi-tenant `orgId` + `getOrgDb()`** | Every association’s data is scoped in application code so one customer cannot read another’s members or events |
| **Webhook signatures + idempotency** | Stripe (and Clerk) events cannot be forged or applied twice; payments map reliably to registrations |
| **Audit logging on key actions** | Imports, exports, deletes, and registration/payment events leave a trail for governance and incident review |
| **Honest Live / Roadmap on marketing** | Public story matches reality; CI checks reduce “we have Commerce” deck drift |
| **PII-only scope (no accidental PHI platform)** | Clear boundary for IT, privacy questionnaires, and vendor contracts |
| **Security practices + rate limits on public registration** | Abuse resistance on open registration endpoints; documented security and contributor rules for sensitive code paths |

**Political line for leadership:**

> We didn’t skip straight to demos. We built **association-grade plumbing** first. The gap isn’t “start over”—it’s **finish the unglamorous layer** before we declare victory on a calendar date.

---

## The gap (what “finish” means—not a rewrite)

Leadership often measures progress by **screens and dates**. Engineering progress here is measured by **checklists**:

| Unglamorous work | Status / intent |
|------------------|-----------------|
| Import staging + human review before apply | Built — use for legacy cutover, not one-click prod import |
| Server-side permissions (`requireCapability`) on export/import/delete/money | Built — ADMIN and role matrix must stay aligned with Clerk |
| Registration and event **state machines** | Built — transitions enforced on payment and status changes |
| Soft-fail automations → **exceptions queue** | Built — email failures don’t pretend success; staff triage at `/{orgSlug}/exceptions` |
| **Runbooks** with owner and replay (Stripe paid / DB pending, bad import, etc.) | Documented — assign named owners before go-live traffic |
| **Subprocessors** for IT/privacy | Documented — counsel still needed for final privacy policy text |
| Module go-live gates per `docs/PRODUCT-CLAIMS.md` | Enforced in process — each new module repeats the same bar |

**Do not declare go-live when:**

- The homepage looks complete but import cutover is still “email me a CSV.”
- Grant decks claim Learn, Commerce, or Insights without Live status.
- No one owns the Stripe/runbook path for “paid externally, pending internally.”

**Do declare go-live for a module when:**

- Tenant isolation tests pass  
- Role matrix matches real staff roles  
- Import path is stage → review → apply for production migration  
- Webhook runbook has an owner and has been exercised once  
- Marketing claims validated against `docs/PRODUCT-CLAIMS.md`  

---

## How to support the project (concrete asks)

1. **Scope:** Approve wedge-first (MemberCore + Events + honest migration), not Protech parity in one phase.  
2. **Claims:** Align grants and decks with `docs/PRODUCT-CLAIMS.md` (Live vs Roadmap).  
3. **Go-live:** Tie dates to the checklist above, not homepage completion alone.  
4. **Operations:** Name owners for runbooks (payments, imports) before production member/event volume.  
5. **Legal/IT:** Route privacy/subprocessor questionnaires to `docs/SUBPROCESSORS.md`; finalize counsel-approved privacy text before public launch.

---

## Related documents (detail for staff and IT)

| Document | Contents |
|----------|----------|
| **`docs/OPERATOR-CHECKLIST.md`** | **One-page Red/Yellow/Green for leadership and IT** |
| **`docs/REALIZATION-PLAN.md`** | **Operational trust, 18-month blocks, Option A pilot path** |
| `docs/UI-QUALITY-BAR.md` | Enforceable admin UI standards |
| `docs/SUPPORTABILITY-GATES.md` | Module GA operability gates |
| `docs/SCOPE.md` | Wedge vs legacy parity; expansion gates |
| `docs/PRODUCT-CLAIMS.md` | What may be said publicly vs roadmap |
| `docs/RUNBOOK.md` | Incident response and replay |
| `docs/SUBPROCESSORS.md` | Vendor table for IT questionnaires |
| `docs/ENGINEERING-INVARIANTS.md` | Process rules mapped to code |
| `docs/VIBE-CODE-RISKS.md` | Why structure beats speed-only builds |
| `CONTRIBUTING.md` | Human review on auth/money paths |

---

**Last updated:** May 2026  
**Product name:** PulsePoint (package: Pulscore)  
**Maintainer:** Assign executive sponsor and engineering lead before external distribution.
