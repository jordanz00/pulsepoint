-- Public take-action response capture (Sprint B)
CREATE TYPE "AdvocacyResponsePosition" AS ENUM ('SUPPORT', 'OPPOSE', 'NEUTRAL');

CREATE TABLE "AdvocacyCampaignResponse" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "memberOrganizationId" TEXT,
    "hospitalName" TEXT NOT NULL,
    "responderName" TEXT NOT NULL,
    "responderEmail" TEXT NOT NULL,
    "responderTitle" TEXT,
    "position" "AdvocacyResponsePosition" NOT NULL DEFAULT 'SUPPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvocacyCampaignResponse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdvocacyCampaignResponse_campaignId_responderEmail_key" ON "AdvocacyCampaignResponse"("campaignId", "responderEmail");
CREATE INDEX "AdvocacyCampaignResponse_orgId_campaignId_idx" ON "AdvocacyCampaignResponse"("orgId", "campaignId");
CREATE INDEX "AdvocacyCampaignResponse_campaignId_memberOrganizationId_idx" ON "AdvocacyCampaignResponse"("campaignId", "memberOrganizationId");

ALTER TABLE "AdvocacyCampaignResponse" ADD CONSTRAINT "AdvocacyCampaignResponse_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdvocacyCampaignResponse" ADD CONSTRAINT "AdvocacyCampaignResponse_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdvocacyCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdvocacyCampaignResponse" ADD CONSTRAINT "AdvocacyCampaignResponse_memberOrganizationId_fkey" FOREIGN KEY ("memberOrganizationId") REFERENCES "MemberOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
