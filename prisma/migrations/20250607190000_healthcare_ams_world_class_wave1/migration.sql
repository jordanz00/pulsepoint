-- Healthcare AMS World-Class Wave 1 — advocacy issue hub + learn workforce (alpha)

-- EventKind
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "capacity" INTEGER,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publicSlug" TEXT NOT NULL,
    "venueName" TEXT NOT NULL DEFAULT '',
    "venueAddress" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "format" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "eventKind" TEXT NOT NULL DEFAULT 'STANDARD',
    "registrationOpensAt" DATETIME,
    "registrationClosesAt" DATETIME,
    "waitlistEnabled" BOOLEAN NOT NULL DEFAULT true,
    "plannerConfig" JSONB,
    "micrositeConfig" JSONB,
    "websiteExportConfig" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Event" SELECT "id", "orgId", "title", "description", "startsAt", "endsAt", "capacity", "priceCents", "status", "publicSlug", "venueName", "venueAddress", "timezone", "format", 'STANDARD', "registrationOpensAt", "registrationClosesAt", "waitlistEnabled", "plannerConfig", "micrositeConfig", "websiteExportConfig", "createdAt", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_orgId_publicSlug_key" ON "Event"("orgId", "publicSlug");
CREATE INDEX "Event_orgId_idx" ON "Event"("orgId");
CREATE INDEX "Event_orgId_status_idx" ON "Event"("orgId", "status");

-- Member workforcePersona
ALTER TABLE "Member" ADD COLUMN "workforcePersona" TEXT NOT NULL DEFAULT 'NONE';

-- AdvocacyIssue extensions
ALTER TABLE "AdvocacyIssue" ADD COLUMN "issueArea" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "AdvocacyIssue" ADD COLUMN "publicSlug" TEXT;
ALTER TABLE "AdvocacyIssue" ADD COLUMN "contentMeta" JSONB;
CREATE UNIQUE INDEX "AdvocacyIssue_orgId_publicSlug_key" ON "AdvocacyIssue"("orgId", "publicSlug");
CREATE INDEX "AdvocacyIssue_orgId_issueArea_idx" ON "AdvocacyIssue"("orgId", "issueArea");

-- Learn workforce models
CREATE TABLE "LearnVideoPlaylist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "trackSlug" TEXT NOT NULL DEFAULT 'general',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearnVideoPlaylist_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "LearnVideoPlaylist_orgId_idx" ON "LearnVideoPlaylist"("orgId");

CREATE TABLE "LearnVideoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "durationMin" INTEGER NOT NULL DEFAULT 0,
    "ceEligible" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LearnVideoItem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearnVideoItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "LearnVideoPlaylist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "LearnVideoItem_orgId_playlistId_idx" ON "LearnVideoItem"("orgId", "playlistId");

CREATE TABLE "LearnWorkforceProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "programType" TEXT NOT NULL DEFAULT 'pipeline',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "eventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearnWorkforceProgram_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearnWorkforceProgram_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "LearnWorkforceProgram_orgId_status_idx" ON "LearnWorkforceProgram"("orgId", "status");

CREATE TABLE "LearnProgramEnrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearnProgramEnrollment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearnProgramEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LearnWorkforceProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearnProgramEnrollment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "LearnProgramEnrollment_programId_memberId_key" ON "LearnProgramEnrollment"("programId", "memberId");
CREATE INDEX "LearnProgramEnrollment_orgId_status_idx" ON "LearnProgramEnrollment"("orgId", "status");
