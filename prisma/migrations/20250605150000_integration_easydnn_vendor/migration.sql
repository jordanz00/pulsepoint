-- Add EASYDNN to IntegrationVendor enum (Postgres). SQLite dev uses Prisma db push.
ALTER TYPE "IntegrationVendor" ADD VALUE IF NOT EXISTS 'EASYDNN';
