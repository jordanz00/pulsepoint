-- CreateEnum
CREATE TYPE "AutomationOutcome" AS ENUM ('PARTIAL_SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "MemberNote" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationException" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "workflow" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "outcome" "AutomationOutcome" NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "context" JSONB NOT NULL DEFAULT '{}',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberNote_orgId_memberId_idx" ON "MemberNote"("orgId", "memberId");
CREATE INDEX "MemberNote_orgId_createdAt_idx" ON "MemberNote"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationException_orgId_resolvedAt_idx" ON "AutomationException"("orgId", "resolvedAt");
CREATE INDEX "AutomationException_orgId_createdAt_idx" ON "AutomationException"("orgId", "createdAt");

-- AddForeignKey
ALTER TABLE "MemberNote" ADD CONSTRAINT "MemberNote_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberNote" ADD CONSTRAINT "MemberNote_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberNote" ADD CONSTRAINT "MemberNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationException" ADD CONSTRAINT "AutomationException_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
