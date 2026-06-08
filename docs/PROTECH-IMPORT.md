# Protech member export → PulsePoint import

**Purpose:** When a pilot association hands you their **Protech (or Excel) member export**, map columns before using **MemberCore → Import review**.

**Status:** Demo preview / alpha — stage → review → apply. Not nightly Protech sync (`docs/PRODUCT-CLAIMS.md`).

---

## Supported columns

PulsePoint detects headers case-insensitively. **Required:** `firstName`, `lastName`. **Recommended:** `email`.

| Column | Aliases (Protech / Excel) | Maps to |
|--------|---------------------------|---------|
| `firstName` | First Name, FirstName, FName, Given Name | Member.firstName |
| `lastName` | Last Name, LastName, LName, Surname | Member.lastName |
| `email` | Email, Email Address, Primary Email | Member.email (dedup key) |
| `phone` | Phone, Mobile, Telephone | Member.phone |
| `status` | Status, MemberStatus | ACTIVE / INACTIVE / LAPSED |
| `company` | Company, Organization, Employer, Hospital | Member.company |
| `jobTitle` | Job Title, Title, Role | Member.jobTitle |
| `tierName` | Tier, MembershipTier, Dues Tier | Links to `MemberTier` |
| `renewalDueAt` | Renewal Date, Renewal_Due | Member.renewalDueAt |
| `organizationName` | Hospital Account, Health System, Account | `MemberOrganization` link |

Canonical template header (copy for IT):

```text
firstName,lastName,email,phone,status,company,jobTitle,tierName,renewalDueAt,organizationName
```

Implementation: `lib/member-import-csv.ts` · apply: `app/actions/member-import.ts`

---

## Limits

| Limit | Value |
|-------|-------|
| Max rows per upload | **10,000** (`lib/member-import-limits.ts`) |
| Apply batch size | **500** rows (`lib/pagination.ts` `IMPORT_BATCH_SIZE`) |
| Capability required | `member:import` (ADMIN) |

---

## Local stress drill (1k rows)

```bash
pnpm import:stress-fixture   # writes tests/fixtures/protech-member-export-1k.csv
```

Upload that file at `/{orgSlug}/members/imports` before staging cutover (Sprint D / G4).

---

## Workflow

1. Export members from Protech (CSV or Excel → save as CSV UTF-8).
2. Align headers to supported names (or use aliases above).
3. Admin → **Import review** (`/{orgSlug}/members/imports`) → upload → fix duplicates → **Apply**.
4. Never blind-insert into production—staging review is the contract.

---

## Example transform (Excel / Google Sheets)

If Protech headers are `First Name`, `Last Name`, `Email Address`, `Hospital Account`, `Dues Tier`:

1. Rename or map to `firstName`, `lastName`, `email`, `organizationName`, `tierName`
2. Remove completely blank rows
3. Split files larger than 10,000 rows

---

## Test fixture

```text
tests/fixtures/protech-member-export.csv
```

```bash
# Upload in Import review UI while local demo is running
open http://localhost:3000/demo-healthcare/members/imports
```

---

## Duplicate handling (demo)

The demo seed includes member `avery.reyes0@demo-healthcare.example`. Import row with the same email is marked **SKIPPED_DUPLICATE** in review—show this to IT as proof dedup works.

---

## Pilot checklist

- [ ] Obtain real export sample (redact if needed); document actual column names below
- [ ] Run one dry-run import in sandbox org
- [ ] Finance signs off on status/tag semantics (ACTIVE vs LAPSED)
- [ ] Named import owner per `docs/PILOT-PLAYBOOK.md`
- [ ] Hospital account names in `organizationName` match `MemberOrganization` records (or create accounts first at `/{orgSlug}/enterprise/organizations`)

| Pilot file received | Date | Column notes |
|---------------------|------|--------------|
| _(fill when known)_ | | |

---

## Related

- `docs/PILOT-PLAYBOOK.md` — Protech cutover week
- `docs/TEN-MEMBER-LEAK-CHECKS.md` — tenant isolation gates
- `docs/PRODUCT-CLAIMS.md` — honest import scope
