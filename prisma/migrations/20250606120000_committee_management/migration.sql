-- Committee management — officer roles and meeting schedules
ALTER TABLE "CommitteeMembership" ADD COLUMN "officerRole" TEXT NOT NULL DEFAULT 'MEMBER';

CREATE TABLE "CommitteeMeeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "location" TEXT NOT NULL DEFAULT '',
    "virtualUrl" TEXT NOT NULL DEFAULT '',
    "agenda" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommitteeMeeting_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommitteeMeeting_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CommitteeMeeting_orgId_committeeId_idx" ON "CommitteeMeeting"("orgId", "committeeId");
CREATE INDEX "CommitteeMeeting_committeeId_startsAt_idx" ON "CommitteeMeeting"("committeeId", "startsAt");
CREATE INDEX "CommitteeMeeting_committeeId_status_idx" ON "CommitteeMeeting"("committeeId", "status");
CREATE INDEX "CommitteeMembership_committeeId_officerRole_idx" ON "CommitteeMembership"("committeeId", "officerRole");
