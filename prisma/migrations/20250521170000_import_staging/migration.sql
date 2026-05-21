-- CreateEnum
CREATE TYPE "MemberImportBatchStatus" AS ENUM ('PENDING_REVIEW', 'APPLIED', 'REJECTED');
CREATE TYPE "MemberImportRowStatus" AS ENUM ('PENDING', 'APPLIED', 'SKIPPED_DUPLICATE', 'REJECTED');

-- CreateTable
CREATE TABLE "MemberImportBatch" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "fileName" TEXT NOT NULL DEFAULT '',
    "status" "MemberImportBatchStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "MemberImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberImportRow" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "status" "MemberImportRowStatus" NOT NULL DEFAULT 'PENDING',
    "matchMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberImportBatch_orgId_status_idx" ON "MemberImportBatch"("orgId", "status");
CREATE UNIQUE INDEX "MemberImportRow_batchId_rowIndex_key" ON "MemberImportRow"("batchId", "rowIndex");
CREATE INDEX "MemberImportRow_orgId_batchId_idx" ON "MemberImportRow"("orgId", "batchId");

-- AddForeignKey
ALTER TABLE "MemberImportBatch" ADD CONSTRAINT "MemberImportBatch_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberImportBatch" ADD CONSTRAINT "MemberImportBatch_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MemberImportRow" ADD CONSTRAINT "MemberImportRow_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberImportRow" ADD CONSTRAINT "MemberImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MemberImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
