# Quake Execute — full ship workflow

**Command:** `pnpm quake:execute [wave-name]`

One command runs the entire proof stack before you merge or demo. Use it at the end of every Quake OS sprint wave.

---

## What it runs (in order)

| Phase | Command | Purpose |
|-------|---------|---------|
| 1 | `pnpm demo:doctor` | Demo org, seed, and homepage integrity |
| 2 | `pnpm exec tsc --noEmit` | Type safety |
| 3 | `pnpm test` | Unit + integration tests |
| 4 | `pnpm claims:validate` + `pnpm leak:checks` | Marketing claims + tenant isolation |
| 5 | `pnpm test:e2e` | Demo wedge + advocacy E2E |
| 6 | `pnpm quake:gates` | Quake OS status board + automation checks |

If all phases pass, the script writes (or updates) `data/quake-os/waves/{wave-name}-wave.md` with a gate checklist for human sign-off.

---

## When to use

- **End of sprint** — after BL items are implemented, before you tell stakeholders it's ready.
- **Before PR** — catch regressions that unit tests alone miss (E2E, leak checks).
- **After executive UI fixes** — marketing previews and KPI layout are E2E-covered on the demo homepage.

---

## Example

```bash
pnpm quake:execute 2026-06-08-sprint-j
```

Produces: `data/quake-os/waves/2026-06-08-sprint-j-wave.md` (if not already present).

---

## Human gates (not automated)

- **BL-003** — staging pilot (Entra, Stripe, legal): `docs/SPRINT-A-OPERATOR-PACKET.md`
- **Branch protection** — enable E2E required check on `main`: `docs/E2E-CI.md`

---

## Related

- [QUAKE-OS.md](./QUAKE-OS.md) — agent roster and continuous improvement
- [QUAKE-OS-CONTINUOUS.md](./QUAKE-OS-CONTINUOUS.md) — daily cadence
- [SUPPORTABILITY-GATES.md](./SUPPORTABILITY-GATES.md) — module GA checklist
