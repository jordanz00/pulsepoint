import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { StoreCatalog } from "@/components/commerce/store-catalog";

export default async function PublicStorePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ product?: string; paid?: string; cancelled?: string }>;
}) {
  const { orgSlug } = await params;
  const query = await searchParams;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const products = await db.commerceProduct.findMany({
    where: { active: true },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });

  return (
    <div className="pp-canvas min-h-screen">
      <header className="pc-glass-chrome border-b px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <span className="font-semibold text-[var(--pc-text)]">{org.name} Store</span>
          <Link href={`/${orgSlug}/join`} className="text-xs font-semibold text-[var(--pc-brand)]">
            Join / renew
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Member store</h1>
        <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
          Membership dues, merchandise, and sponsorships. Dues payments extend your renewal date
          automatically.
        </p>

        {query.paid === "1" ? (
          <p className="pc-card mt-6 text-sm text-[var(--status-live-fg)]">
            Payment received — thank you! Dues renewals update your membership date; orders appear
            in the member portal.
          </p>
        ) : null}
        {query.cancelled === "1" ? (
          <p className="pc-card mt-6 text-sm text-[var(--pc-text-secondary)]">Checkout cancelled.</p>
        ) : null}

        <div className="mt-8">
          <StoreCatalog
            orgSlug={orgSlug}
            highlightProductId={query.product}
            products={products.map((p) => ({
              id: p.id,
              sku: p.sku,
              name: p.name,
              description: p.description,
              kind: p.kind,
              priceCents: p.priceCents,
              currency: p.currency,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
