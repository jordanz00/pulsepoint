-- Extended member import staging columns (tier, renewal, hospital account, CRM fields)
ALTER TABLE "MemberImportRow" ADD COLUMN "phone" TEXT;
ALTER TABLE "MemberImportRow" ADD COLUMN "company" TEXT;
ALTER TABLE "MemberImportRow" ADD COLUMN "jobTitle" TEXT;
ALTER TABLE "MemberImportRow" ADD COLUMN "memberStatus" TEXT;
ALTER TABLE "MemberImportRow" ADD COLUMN "tierName" TEXT;
ALTER TABLE "MemberImportRow" ADD COLUMN "renewalDueAt" TIMESTAMP(3);
ALTER TABLE "MemberImportRow" ADD COLUMN "organizationName" TEXT;
