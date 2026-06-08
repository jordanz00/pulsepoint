-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VIEWER', 'TRAFFICKER', 'MLR_REVIEWER', 'OPS_LEAD', 'ADMIN');

-- CreateEnum
CREATE TYPE "CampaignState" AS ENUM ('DRAFT', 'QA', 'APPROVED', 'READY_TO_TRAFFIC', 'SYNCED', 'LIVE', 'OPTIMIZING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CreativeState" AS ENUM ('DRAFT', 'SUBMITTED', 'MLR_APPROVED', 'LOCKED', 'TRAFFICKED', 'LIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'DEAD');

-- CreateEnum
CREATE TYPE "FieldOwner" AS ENUM ('AMS', 'PULSEPOINT', 'BOTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "amsUuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "state" "CampaignState" NOT NULL DEFAULT 'DRAFT',
    "budgetUsd" DECIMAL(14,2) NOT NULL,
    "flightStart" DATE NOT NULL,
    "flightEnd" DATE NOT NULL,
    "pulsepointId" TEXT,
    "audienceQaAt" TIMESTAMP(3),
    "budgetQaAt" TIMESTAMP(3),
    "creativeQaAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "pacingAlertPct" INTEGER NOT NULL DEFAULT 85,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creative" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "CreativeState" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "contentHash" TEXT,
    "mlrApprovedAt" TIMESTAMP(3),
    "mlrApprovedBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "pulsepointTagId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceList" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "filename" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "valid" BOOLEAN NOT NULL DEFAULT false,
    "validationReport" JSONB,
    "suppressionVersion" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdMapping" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "amsField" TEXT NOT NULL,
    "pulsepointField" TEXT NOT NULL,
    "owner" "FieldOwner" NOT NULL,
    "amsValue" TEXT,
    "pulsepointValue" TEXT,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "IdMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "errorCode" TEXT,
    "errorDetail" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationRun" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "amsValue" DECIMAL(14,4),
    "pulsepointValue" DECIMAL(14,4),
    "delta" DECIMAL(14,4),
    "deltaExplain" TEXT,
    "withinTolerance" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportingSnapshot" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "value" DECIMAL(14,4) NOT NULL,
    "source" TEXT NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PacingAlert" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "pacingPct" DECIMAL(5,2) NOT NULL,
    "daysLeft" INTEGER,
    "message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PacingAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricDefinition" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "includesFees" BOOLEAN NOT NULL DEFAULT false,
    "pulsepointField" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "MetricDefinition_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ErrorRunbook" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "steps" JSONB NOT NULL,

    CONSTRAINT "ErrorRunbook_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_amsUuid_key" ON "Campaign"("amsUuid");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceList" ADD CONSTRAINT "AudienceList_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdMapping" ADD CONSTRAINT "IdMapping_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportingSnapshot" ADD CONSTRAINT "ReportingSnapshot_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PacingAlert" ADD CONSTRAINT "PacingAlert_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

