-- Neon Postgres only: GIN full-text index for member directory search at 10k+ scale.
-- Run manually against production when on Postgres (not applied by SQLite dev migrate).
-- Example: psql $DIRECT_URL -f prisma/migrations/manual_search_index/migration.sql

CREATE INDEX CONCURRENTLY IF NOT EXISTS member_search_idx
ON "Member" USING gin(
  to_tsvector('english',
    coalesce("firstName", '') || ' ' ||
    coalesce("lastName", '') || ' ' ||
    coalesce("email", '')
  )
);
