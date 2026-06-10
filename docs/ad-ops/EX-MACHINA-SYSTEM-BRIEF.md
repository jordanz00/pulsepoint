# Ex Machina System Brief — PulsePoint Ad-Ops

**Purpose:** Narrative architecture lens for demos, portfolio, and IT handoff conversations.  
**Stage honesty:** v0.1 pre-IT-handoff. Metrics from repo scan — not invented.  
**Canonical repo:** `/Users/jordanzabady/Desktop/pulse`  
**Last updated:** 2026-06-09

---

## The modified Turing test

Classic Turing: *Can the machine fool the human into thinking it is conscious?*

**AMS version:** *Can the ad-ops UI fool the operator into believing the system of record is complete — while the execution layer, identity plane, and live DSP contract are still behind glass?*

| Film | AMS |
|------|-----|
| Blue Book | Healthcare ad ops — system of record for **campaign + spend + compliance** |
| Nathan's compound | Unified repo: Next.js + `packages/api` + Worker + Postgres + Redis — pre-Azure, pre-Entra |
| Observation glass | `/[orgSlug]/advertising/*` — campaigns, sync, audit, metrics |
| Caleb | First operator / IT evaluator |
| Ava | Glass UI, state badges, runbooks — **human-readable face** |
| Mesh under the skin | Stub PulsePoint client (`PP-STUB-*`), dev header auth, Phases 1–8 not yet shipped |
| Kyoko | BullMQ worker — silent execution |
| Power cut / escape | IT handoff — Entra, Key Vault, live PulsePoint egress |

---

## Sacrifice ledger (verified)

| Sacrifice | What it buys | Where |
|-----------|--------------|-------|
| Dev header auth | Local velocity | `docs/ad-ops/README.md` — disabled in production Phase 2 |
| PulsePoint stub | Safe demo without secrets | `packages/api/src/services/pulsepoint-client.ts` |
| DSP not replaced | Clear system-of-record boundary | `docs/ad-ops/ARCHITECTURE.md` |
| Phases 1–8 queued | Honest roadmap | Hardening, Entra, observability, IaC not faked as done |

**Knowledge preserved:** Immutable audit, NPI Luhn gate, state machines, reconciliation math.

---

## Scene guide for demos

1. **First session** — Open `/demo-healthcare/advertising`. KPIs + sync health visible.
2. **Discovery** — Stub mode in sync errors or `docs/ad-ops/IT-HANDOFF.md`.
3. **Escape plot** — Entra app reg, Key Vault, PulsePoint allowlist.
4. **Ending** — Dev auth retired. Stub sacrificed. Truth remains in Postgres.

---

## Generate status board

```bash
cd /Users/jordanzabady/Desktop/pulse
python3 scripts/generate-status-board.py
open status-board.html
```

---

## Competitive frame

> System of record owns truth. PulsePoint owns execution.  
> Beat incumbents on **trust, accuracy, and fewer handoffs** — not feature sprawl or faux-AI.

**Answer we ship:** Verify. Audit tab. Recon run. Runbook link. Then approve.
