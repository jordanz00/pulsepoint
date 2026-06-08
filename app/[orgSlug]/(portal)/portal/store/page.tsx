import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";
import { StoreCatalog } from "@/components/commerce/store-catalog";
import { requirePortalSession } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";
import { prisma } from "@/lib/prisma";

export default async function PortalStorePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const { orgSlug } = await params;
  const query = await searchParams;
  await requirePortalSession(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const products = await db.commerceProduct.findMany({
    where: { orgId: org.id, active: true },
    orderBy: { name: "asc" },
    take: 30,
  });

  const portal = await resolvePortalMember(orgSlug);
  const member = portal.ok ? portal.member : null;

  return (
    <div className="portal-page pp-route-enter">
      <header className="portal-page__head">
        <div className="portal-section__icon portal-section__icon--page" aria-hidden>
          <ShoppingBag size={24} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="portal-page__title">Member store</h1>
          <p className="portal-page__lead">
            Dues, merchandise, and sponsorship — orders appear in your invoices.
          </p>
        </div>
      </header>

      {query.paid === "1" ? (
        <p className="ds-page-subtitle portal-store-banner portal-store-banner--ok">
          Payment received. View your order under{" "}
          <Link href={`/${orgSlug}/portal#invoices`}>My invoices</Link>.
        </p>
      ) : null}
      {query.cancelled === "1" ? (
        <p className="ds-page-subtitle portal-store-banner">Checkout cancelled.</p>
      ) : null}

      {!portal.ok ? (
        <div className="portal-empty ds-card ds-glass">
          <p>{portal.error}</p>
          <p className="portal-empty__sub">
            Use the same email as your membership record, or ask staff to link your account.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="portal-empty ds-card ds-glass">
          <p>No products available right now.</p>
        </div>
      ) : (
        <StoreCatalog
          orgSlug={orgSlug}
          checkoutPath="portal/store"
          hideEmailInput
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
      )}

      {member ? (
        <p className="portal-page__footer">
          Signed in as {member.firstName} {member.lastName}.{" "}
          <Link href={`/${orgSlug}/portal`} className="portal-section__link">
            Back to portal
          </Link>
        </p>
      ) : null}
    </div>
  );
}
