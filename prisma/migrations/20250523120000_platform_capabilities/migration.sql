-- Member CRM, event conference, communities, report scheduling (alpha)

-- AlterTable Member
ALTER TABLE "Member" ADD COLUMN "engagementScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Member" ADD COLUMN "engagementTier" TEXT NOT NULL DEFAULT 'inactive';
ALTER TABLE "Member" ADD COLUMN "tierId" TEXT;
CREATE INDEX "Member_orgId_engagementTier_idx" ON "Member"("orgId", "engagementTier");

-- AlterTable Event
ALTER TABLE "Event" ADD COLUMN "micrositeConfig" JSONB;

-- CreateTable MemberBadge
CREATE TABLE "MemberBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberBadge_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MemberBadge_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MemberBadge_orgId_memberId_code_key" ON "MemberBadge"("orgId", "memberId", "code");
CREATE INDEX "MemberBadge_orgId_memberId_idx" ON "MemberBadge"("orgId", "memberId");

-- CreateTable RenewalWorkflow
CREATE TABLE "RenewalWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "tierId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "steps" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RenewalWorkflow_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "RenewalWorkflow_orgId_active_idx" ON "RenewalWorkflow"("orgId", "active");

-- CreateTable EventSpeaker
CREATE TABLE "EventSpeaker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "organization" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'SPEAKER',
    "memberId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventSpeaker_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventSpeaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "EventSpeaker_orgId_eventId_idx" ON "EventSpeaker"("orgId", "eventId");

-- CreateTable EventSponsor
CREATE TABLE "EventSponsor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'Gold',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "websiteUrl" TEXT NOT NULL DEFAULT '',
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "memberId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventSponsor_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventSponsor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "EventSponsor_orgId_eventId_idx" ON "EventSponsor"("orgId", "eventId");

-- CreateTable EventSession
CREATE TABLE "EventSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "room" TEXT NOT NULL DEFAULT '',
    "track" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventSession_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "EventSession_orgId_eventId_idx" ON "EventSession"("orgId", "eventId");

-- CreateTable CommunitySpace
CREATE TABLE "CommunitySpace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunitySpace_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CommunitySpace_orgId_slug_key" ON "CommunitySpace"("orgId", "slug");
CREATE INDEX "CommunitySpace_orgId_idx" ON "CommunitySpace"("orgId");

-- CreateTable CommunityMembership
CREATE TABLE "CommunityMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityMembership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityMembership_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "CommunitySpace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CommunityMembership_spaceId_memberId_key" ON "CommunityMembership"("spaceId", "memberId");
CREATE INDEX "CommunityMembership_orgId_spaceId_idx" ON "CommunityMembership"("orgId", "spaceId");

-- CreateTable ReportSchedule
CREATE TABLE "ReportSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metricKeys" JSONB NOT NULL,
    "cadence" TEXT NOT NULL DEFAULT 'MONTHLY',
    "recipients" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "nextRunAt" DATETIME,
    "lastRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReportSchedule_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ReportSchedule_orgId_active_idx" ON "ReportSchedule"("orgId", "active");

-- Member tier FK
CREATE INDEX "Member_tierId_idx" ON "Member"("tierId");
