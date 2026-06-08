import { PortalHub } from "@/components/portal/portal-hub";
import { loadPortalDashboard } from "@/lib/portal/load-portal-dashboard";
import { requirePortalSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My portal — PulsePoint",
  description: "Your membership, events, committees, certifications, invoices, and community.",
};

export default async function MemberPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ renewed?: string; renewal_cancelled?: string }>;
}) {
  const { orgSlug } = await params;
  const query = await searchParams;
  await requirePortalSession(orgSlug);

  const dashboard = await loadPortalDashboard(orgSlug);

  if (!dashboard.ok) {
    return (
      <div className="portal-error ds-card">
        <p className="portal-error__title">We could not load your account</p>
        <p className="portal-error__body">{dashboard.error}</p>
        <p className="portal-error__hint">
          Sign in with the same email as your membership roster record for automatic
          linking, or ask staff to connect your account from your member profile.
        </p>
      </div>
    );
  }

  return (
    <PortalHub
      orgSlug={orgSlug}
      data={dashboard.data}
      renewed={query.renewed === "1"}
      renewalCancelled={query.renewal_cancelled === "1"}
    />
  );
}
