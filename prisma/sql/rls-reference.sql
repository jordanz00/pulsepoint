-- Optional Postgres RLS (second line of defense) — enable when IT ready.
-- App must SET app.org_id per request before queries (e.g. Prisma middleware).

-- Example for Member (repeat pattern per tenant table):
-- ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY member_tenant_isolation ON "Member"
--   USING ("orgId" = current_setting('app.org_id', true));

-- PulsePoint today enforces tenancy in application via getOrgDb(orgId).
-- See docs/SECURITY-PARANOID.md
