# Prisma `select:` debt — paying it down without breaking everything

## What this is

Prisma's `findMany` / `findFirst` / `findUnique` calls **return every column
on the model by default** unless you pass an explicit `select:` (or `omit:`)
clause. That is functionally `SELECT *` — same anti-pattern, same costs:

- Extra bytes over the wire on every page render.
- Every downstream consumer learns about every column, even ones it doesn't
  use (tight coupling).
- New sensitive columns (e.g. internal staff notes, deletion reasons) become
  silently exposed to every existing call site.
- Painful to fix later — each call site needs to be audited for the columns
  it actually uses, then tested.

The CI check in `scripts/security-audit.sh` prints how many query call sites
have an explicit `select:` clause vs how many don't (`INFO: Prisma reads w/
explicit select: X of Y`). It's a **warning, not a hard fail** — we pay this
debt down incrementally.

## The rule (going forward)

**Every new or substantively-edited Prisma read query MUST include an
explicit `select:` clause** listing only the columns the caller uses.

```ts
// ❌ Default — returns every column on Member.
const members = await db.member.findMany({ where: { status: "ACTIVE" } });

// ✅ Lists only what the page renders.
const members = await db.member.findMany({
  where: { status: "ACTIVE" },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    status: true,
  },
});
```

Exceptions (no `select:` needed):

- `delete` / `deleteMany` (no rows returned).
- `update` / `updateMany` that don't read the row back.
- Audit-log writes (`auditLog.create` already specifies its full payload).
- Scripts under `scripts/` and `prisma/seed*.ts` (dev-only).

## How to pay the debt down

1. Pick a single page or server action.
2. Read the file. Note which columns of the queried model are actually used
   (`.firstName`, `.email`, etc.) by the JSX / downstream code.
3. Add `select: { ... }` to the Prisma call listing exactly those columns.
4. Type-check (`pnpm typecheck`). If TypeScript complains about a missing
   property, that's the system telling you the page was relying on a column
   you didn't list — add it.
5. Run unit / integration tests touching that page.
6. Open a small PR ("perf: add explicit select to members admin page").

**Do not** do a bulk refactor across many files in one PR — Prisma's
implicit-column behavior interacts with `include:` and relation loading in
ways that are easy to break in tests.

## Current state

Run this to see the latest delta:

```
pnpm security:audit
```

and look for the `INFO: Prisma reads w/ explicit select:` line.

## Why this isn't a CI failure (yet)

The codebase ships with no explicit `select:` clauses today (it's all green-
field, no production traffic). Failing CI now would block every PR. Once we
get above ~70% of call sites covered, we'll flip the CI rule to require
`select:` on any **newly added** query (via a git-diff scoped check), and
eventually require it everywhere.
