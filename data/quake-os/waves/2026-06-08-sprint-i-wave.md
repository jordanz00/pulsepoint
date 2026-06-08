# Quake OS — Sprint I (alpha module GA ladder)

**Date:** 2026-06-08  
**Follows:** Sprint H (`2026-06-08-sprint-h-wave.md`)  
**Theme:** Block 2 hardening — Learn, Engage, Commerce, Insights + planning truth

---

## Research summary (AMS gaps)

| Priority | Gap | Status after I |
|----------|-----|----------------|
| P1 | Commerce export untested | CSV parity helpers + unit tests |
| P1 | Engage tag filter ignored; failures silent | Tag filter + `AutomationException` |
| P1 | Learn — no staff enrollment / transcript export | `enrollMemberInCourse`, `exportMemberTranscriptCsv` |
| P1 | Insights — no snapshot parity guard | `snapshotsMatchResolved` + tests |
| P2 | Quake KG still `blocked_by` take-action | `implements` + deduped graph |
| P2 | Supportability rows missing Learn/Insights/Advocacy | Added to SUPPORTABILITY-GATES |
| Human | BL-003 pilot ops | Unchanged |

**Deferred:** PAC/FEC, legislative vendor feed, communities upload, Power BI embed, member B2C SSO, GL sync.

---

## Shipped

| ID | Item | Artifact |
|----|------|----------|
| BL-019 | Quake OS planning truth | `store.ts`, `graph.json`, `research-engine.ts`, `discoveries.ts`, `advocacy_ga` → alpha |
| BL-020 | Learn enrollment + transcript | `app/actions/learn.ts`, `lib/learn/transcript-csv.ts`, Learn UI |
| BL-021 | Engage send hardening | `lib/engage/recipient-filter.ts`, `app/actions/engage.ts` |
| BL-022 | Commerce export parity tests | `lib/commerce/csv-export.ts`, `tests/unit/commerce-export-parity.test.ts` |
| BL-023 | Insights metric parity | `lib/report-metrics.ts`, `tests/unit/insights-metric-parity.test.ts` |
| BL-024 | Supportability gates Learn/Insights/Advocacy | `docs/SUPPORTABILITY-GATES.md` |

---

## Gates

```bash
pnpm demo:doctor
pnpm test
pnpm test:e2e
pnpm claims:validate
pnpm leak:checks
pnpm quake:gates
```

---

## Sprint J — candidates

1. **Giving** export parity integration test (campaign totals = CSV)
2. **Commerce** webhook idempotency integration test
3. **Member profile** transcript download button (Learn export wired)
4. **Communities** document upload MVP (alpha)
5. **Renewals** cron gate + staff renewal report polish
6. Flip first supportability `[ ]` after pilot sign-off (Commerce or Advocacy)
