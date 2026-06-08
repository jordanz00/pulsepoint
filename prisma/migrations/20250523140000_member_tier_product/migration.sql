-- Link membership tiers to CommerceProduct for dues checkout.
ALTER TABLE "MemberTier" ADD COLUMN "productId" TEXT;

ALTER TABLE "MemberTier" ADD CONSTRAINT "MemberTier_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "CommerceProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
