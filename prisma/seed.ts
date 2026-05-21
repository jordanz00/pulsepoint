/**
 * Optional dev seed — run: pnpm db:seed
 * Requires DATABASE_URL and existing Clerk org IDs if mirroring real tenants.
 */

import { prisma } from "../lib/prisma";

async function main() {
  const orgId = "org_dev_pulscore";
  const userId = "user_dev_owner";

  await prisma.organization.upsert({
    where: { id: orgId },
    create: {
      id: orgId,
      slug: "demo-healthcare",
      name: "Demo Healthcare Association",
      plan: "trial",
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: "owner@demo-healthcare.example",
      name: "Demo Owner",
    },
    update: {},
  });

  await prisma.orgMembership.upsert({
    where: { orgId_userId: { orgId, userId } },
    create: { orgId, userId, role: "OWNER" },
    update: {},
  });

  console.log("Seeded demo-healthcare organization");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
