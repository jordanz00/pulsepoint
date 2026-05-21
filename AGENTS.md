# PulsePoint — Agent Rules

> Read this **before** generating, refactoring, or reviewing any code in this
> repo. Honored by Cursor, Claude Code, Codex CLI, and any other AI agent
> that respects `AGENTS.md`.

PulsePoint is a multi-tenant Association Management System holding member
PII (names, emails, phone numbers) for healthcare associations. The cost of
a mistake here is "association leaked member list" headlines. Therefore the
rules below are **non-negotiable** — accuracy and safety beat brevity.

---

## 1. Database access (THE big one)

### 1a. Never use template literals inside `query()` / `execute()` / `$queryRaw` / `$executeRaw` / `run()` calls

The textbook AI-generated SQL injection bug looks like this:

```ts
// ❌ NEVER — anyone can pass " OR '1'='1' as `name`
const users = await db.query(`SELECT * FROM users WHERE name = '${req.query.name}'`);
```

It looks fine in testing because `name = "john"` does match John's row. It is
a critical vulnerability the moment a real user hits it.

**Always use parameterized queries:**

```ts
// ✅ pg
await db.query("SELECT id, name, email FROM users WHERE name = $1", [name]);

// ✅ Prisma raw (tagged template — Prisma parameterizes automatically)
await prisma.$queryRaw`SELECT id, name, email FROM users WHERE name = ${name}`;
```

> **Prisma note:** Prisma's `$queryRaw` tagged-template form *is* safe — Prisma
> parameterizes the interpolated values. `$queryRawUnsafe(...)` with string
> concatenation is **not** safe. If you find yourself reaching for
> `$queryRawUnsafe`, stop and use a typed Prisma query instead.

CI enforces this via `scripts/security-audit.sh`. Do not weaken the grep.

### 1b. Prefer typed Prisma queries to raw SQL

PulsePoint goes through `lib/db.ts` → `getOrgDb(orgId)` for **every** read or
write on a tenant-scoped model. This automatically injects the `orgId` WHERE
clause and prevents cross-tenant leaks. Bypassing it (e.g. `prisma.member.*`
directly in app code) is rejected by CI.

```ts
// ❌
const members = await prisma.member.findMany({ where: { lastName: q } });

// ✅
const db = getOrgDb(staff.orgId);
const members = await db.member.findMany({
  where: { lastName: { contains: q, mode: "insensitive" } },
  select: { id: true, firstName: true, lastName: true, email: true, status: true },
});
```

### 1c. Always include an explicit `select:` clause

Default Prisma `findMany` / `findFirst` / `findUnique` returns **every column**
— Prisma's equivalent of `SELECT *`. Same anti-pattern, same cost:

- Pulls extra bytes over the wire on every page render.
- Forces every downstream consumer to know about every column.
- Surfaces columns that may later contain sensitive data (e.g. internal
  notes, soft-delete reasons) without you noticing.
- Painful to fix later — every call site has to be audited for what columns
  it actually used.

**Rule for new code:** every read query MUST include a `select:` clause
listing only the columns the caller uses.

**Existing code:** there is a tracked debt list in
[`docs/SELECT-STAR-DEBT.md`](docs/SELECT-STAR-DEBT.md). New code that touches
an existing query is expected to add the `select:` clause as part of the
diff. We pay it down incrementally — never in a giant bulk rewrite (those
break tests in subtle ways).

Exceptions (acceptable to omit `select:`):
- Server actions performing a `delete` / `update` that don't read the row.
- Audit-log writes that already know their full payload.
- Diagnostic / dev-only scripts under `scripts/` and `prisma/`.

---

## 2. Auth, money, webhooks

You may not write or substantively modify these files without a human review
+ threat model in the PR description:

- `lib/auth.ts`, `lib/permissions.ts`, `lib/demo-mode.ts`
- `app/api/webhooks/**` (Stripe, Clerk, anything signed)
- Anything that calls `stripe.*`, `clerk.*`, or sets cookies / sessions

`scripts/check-sensitive-paths.sh` flags edits to these paths in CI. See
[`docs/SECURITY-PARANOID.md`](docs/SECURITY-PARANOID.md).

---

## 3. Multi-tenancy

- All tenant-scoped reads/writes go through `getOrgDb(orgId)`.
  See [`lib/db.ts`](lib/db.ts).
- Member-list reads (search, export) must call `assertAllRowsBelongToOrg()`
  and `capMemberListRows()` from `lib/tenant-guards.ts`.
- Admin RSC routes use `requireOrgAccessForSlug(orgSlug)` so a logged-in
  user of Org A cannot access Org B by typing the URL.
- Every protected mutation calls `requireCapability("member:export", { orgSlug })`
  or equivalent — never bare `requireStaffSession()`.

Ten automated leak checks (`pnpm leak:checks`) gate every change.

---

## 4. Marketing honesty

- Live features ship with the `Badge variant="live"`.
- Roadmap features ship with `Badge variant="roadmap"` and a clear
  "Coming soon" treatment.
- `docs/PRODUCT-CLAIMS.md` is the source of truth.
- `pnpm claims:validate` rejects marketing copy that claims roadmap items
  as available.

---

## 5. Testing

- Unit tests live in `tests/unit/`.
- Integration tests (real Postgres) live in `tests/integration/`.
- E2E lives in `tests/e2e/` (Playwright).
- New tenant-scoped models REQUIRE a cross-tenant isolation integration test
  before merge. See `tests/integration/member-tenant-isolation.test.ts` as
  the reference.

---

## 6. Demo mode

Demo mode (`DEMO_MODE=true` + `DEMO_SESSION_SECRET`) is for prototype-only
sign-in. Triple-gated and refuses to run in production. Anything you add
that consults `requireStaffSession()` automatically respects it. See
[`docs/DEMO-MODE.md`](docs/DEMO-MODE.md).

---

## 7. Commit / PR etiquette

- Small, reviewable diffs over bulk rewrites.
- Conventional Commits subject line; explain **why** in the body, not what.
- If you touched anything in `§2`, the PR body must include a one-paragraph
  threat model.
- Run before opening a PR:
  ```
  pnpm typecheck
  pnpm lint
  pnpm test
  pnpm security:audit
  ```

---

## 8. Never invent data, claims, or policy

- No fabricated statistics, vendor pricing, healthcare regulations, or
  customer quotes anywhere in marketing or product copy.
- If you don't know the source for a number, write "TODO: source" instead
  of guessing.

---

## TL;DR for AI agents

1. **Parameterize every SQL query.** Tagged templates only with Prisma's
   `$queryRaw`. No string concatenation, ever, under any circumstance.
2. **Add a `select:` clause to every new Prisma read.** No SELECT *.
3. **Go through `getOrgDb`.** Never `prisma.member.*` in app code.
4. **Don't touch `§2` files without a human + threat model.**
5. **Run `pnpm security:audit` before pushing.**
