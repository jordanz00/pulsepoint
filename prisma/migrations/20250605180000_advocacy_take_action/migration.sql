-- Advocacy take-action MVP — campaign audience link + hospital participation counts
ALTER TABLE "AdvocacyCampaign" ADD COLUMN "audienceId" TEXT;
ALTER TABLE "AdvocacyCampaign" ADD COLUMN "targetCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AdvocacyCampaign" ADD COLUMN "responseCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "AdvocacyCampaign_orgId_audienceId_idx" ON "AdvocacyCampaign"("orgId", "audienceId");
