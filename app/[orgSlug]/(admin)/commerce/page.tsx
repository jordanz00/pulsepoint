import { requireOrgAccessForSlug } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { SimplePreviewList } from "@/components/admin/simple-preview-list";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { CommerceQuickAdd } from "@/components/commerce/commerce-quick-add";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { getActivePaymentAdapter } from "@/lib/adapters/payments";
import { ADMIN_PAGES, isEasyAdminMode, pageSubtitle } from "@/lib/admin-page-copy";

export const dynamic = "force-dynamic";

function fmtCents(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function CommercePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const easy = isEasyAdminMode(orgSlug);
  const staff = await requireOrgAccessForSlug(orgSlug);
  const db = getOrgDb(staff.orgId);

  const [products, orders] = await Promise.all([
    db.commerceProduct.findMany({ orderBy: { createdAt: "desc" }, take: easy ? 20 : 50 }),
    db.commerceOrder.findMany({
      include: { items: { include: { product: true } }, member: true },
      orderBy: { createdAt: "desc" },
      take: easy ? 10 : 25,
    }),
  ]);
  const adapter = getActivePaymentAdapter();

  if (easy) {
    return (
      <AdminPage orgSlug={orgSlug}>
        <PageHeader
          title={ADMIN_PAGES.commerce.title}
          subtitle={pageSubtitle(orgSlug, "commerce")}
          backHref={`/${orgSlug}`}
          backLabel="Home"
        />
        <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="commerce" />
        <h2 className="pc-simple-section-title">Products for sale</h2>
        <SimplePreviewList
          items={products.map((p) => ({
            id: p.id,
            title: p.name,
            detail: `${fmtCents(p.priceCents, p.currency)} · ${p.active ? "Available" : "Hidden"}`,
          }))}
        />
        {orders.length > 0 ? (
          <>
            <h2 className="pc-simple-section-title mt-8">Recent orders</h2>
            <SimplePreviewList
              items={orders.map((o) => ({
                id: o.id,
                title: o.member
                  ? `${o.member.firstName} ${o.member.lastName}`
                  : "Guest order",
                detail: `${fmtCents(o.totalCents, o.currency)} · ${o.status === "PAID" ? "Paid" : o.status}`,
              }))}
            />
          </>
        ) : null}
      </AdminPage>
    );
  }

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="PulsePoint Commerce"
        subtitle={pageSubtitle(orgSlug, "commerce")}
        badge="alpha"
      />
      <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="commerce" />
      <p className="text-sm text-[var(--pc-text-secondary)]">
        Active payment adapter: <strong>{adapter.id}</strong>
      </p>
      <CommerceQuickAdd orgSlug={orgSlug} products={products} />
      <section>
        <h2 className="pc-simple-section-title mb-3">Products ({products.length})</h2>
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{fmtCents(p.priceCents, p.currency)}</td>
                  <td>
                    {p.active ? <Badge variant="live">Yes</Badge> : <Badge variant="roadmap">No</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPage>
  );
}
