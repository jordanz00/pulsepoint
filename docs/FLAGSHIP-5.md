# Flagship 5 — buyer one-pager

**Positioning:** Executive visibility, membership health, integrated advocacy, board reporting, and honest migration — on one AMS.

**Registry:** `lib/flagship-features.ts`  
**Marketing copy:** `lib/flagship-marketing.ts`  
**Claims:** [PRODUCT-CLAIMS.md](./PRODUCT-CLAIMS.md) (Flagship 5 table)

---

## Demo URLs (Sterling Healthcare / `demo-healthcare`)

| Feature | Hub | Primary demo |
|---------|-----|--------------|
| Executive Command Center | `/demo-healthcare/flagship/executive` | `/demo-healthcare/command-center` |
| Membership Intelligence | `/demo-healthcare/flagship/membership` | `/demo-healthcare/members/analytics` |
| Advocacy on One Roster | `/demo-healthcare/flagship/advocacy` | `/demo-healthcare/enterprise/advocacy` |
| Board Briefing Pack | `/demo-healthcare/flagship/board` | `/demo-healthcare/insights/board-pack` |
| Migration Without Rip-and-Replace | `/demo-healthcare/flagship/migration` | `/demo-healthcare/members/imports` |

**Hub:** `/demo-healthcare/flagship`  
**5-stop walkthrough:** `/demo-healthcare/flagship/walkthrough?step=0` (~14 min script)  
**Marketing:** `/#flagship-features`

**Depth catalog (internal):** `/demo-healthcare/showcase` — Top 20 features; not a substitute for Flagship labels.

---

## Honest scope per feature

| # | Name | Label | Safe to say |
|---|------|-------|-------------|
| 1 | Executive Command Center | **Live** | One-screen CEO briefing, leadership loop script |
| 2 | Membership Intelligence | **Demo preview** | Board KPIs, rule-based tiers, at-risk list |
| 3 | Advocacy on One Roster | **Alpha** | Hospital roster linkage, issue hub, take-action |
| 4 | Board Briefing Pack | **Demo preview** | Printable HTML export, manual snapshots |
| 5 | Migration Without Rip-and-Replace | **Demo preview** | CSV staging, honest Protech compare |

Do **not** claim: ML engagement scoring, nightly Protech sync, Power BI embed as shipped, feature parity, or invented pricing.

---

## Sales script (5 stops)

1. **Executive** (~3 min) — Command center KPIs → leadership loop preview  
2. **Membership** (~3 min) — Analytics + MemberPulse at-risk  
3. **Advocacy** (~3 min) — Roster linkage stats → staff issue hub  
4. **Board** (~2 min) — Board pack print → insights widgets  
5. **Migration** (~3 min) — Import staging → compare Protech matrix  

Walkthrough data: `lib/flagship-walkthrough.ts`

---

## Verification

```bash
pnpm typecheck
pnpm test tests/unit/flagship-features.test.ts
pnpm claims:validate
pnpm leak:checks
```

E2E: `tests/e2e/flagship-hub.spec.ts` (requires `DEMO_MODE=true` + seed).
