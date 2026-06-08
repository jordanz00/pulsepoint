import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { INTEGRATION_REGISTRY } from "@/lib/association";
import { MicrosoftConnectPanel } from "@/components/integrations/microsoft-connect-panel";
import { getMicrosoft365Connection } from "@/lib/adapters/microsoft365";
import { getEasyDnnSiteConfig } from "@/lib/adapters/cms";
import { EasyDnnConnectPanel } from "@/components/integrations/easydnn-connect-panel";
import { IntegrationRegistryGrid } from "@/components/integrations/integration-registry-grid";
import { ProtechGlExportPanel } from "@/components/finance/protech-gl-export-panel";
import { ENTERPRISE_GO_LIVE_STEPS } from "@/lib/enterprise-integrations-marketing-preview";
import { moduleCssVars } from "@/lib/module-colors";
import type { Microsoft365ConnectionConfig } from "@/lib/adapters/microsoft365/types";
import type { EasyDnnSiteConfig } from "@/lib/adapters/cms/types";

const vendorEnumForId: Record<string, string> = {
  microsoft_365: "MICROSOFT_365",
  easydnn: "EASYDNN",
  teams: "MICROSOFT_TEAMS",
  stripe: "STRIPE",
  clerk: "CLERK",
  resend: "RESEND",
  power_bi: "POWER_BI",
  salesforce: "SALESFORCE",
  hubspot: "HUBSPOT",
  netsuite: "NETSUITE",
  quickbooks: "QUICKBOOKS",
  zoom: "ZOOM",
  lms: "LMS",
  legislative_tracker: "LEGISLATIVE_TRACKER",
};

function statusClass(tone: string) {
  if (tone === "live") return "pp-ei-status--live";
  if (tone === "pilot") return "pp-ei-status--pilot";
  if (tone === "export") return "pp-ei-status--export";
  return "pp-ei-status--shipped";
}

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const connections = await db.integrationConnection.findMany({
    where: { orgId: org.id },
    orderBy: { vendor: "asc" },
  });
  const byVendor = new Map(connections.map((c) => [c.vendor, c]));
  const msConn = await getMicrosoft365Connection(org.id);
  const msCfg = (msConn?.config ?? {}) as Microsoft365ConnectionConfig;
  const easyDnnConfig = await getEasyDnnSiteConfig(org.id);

  const gridItems = INTEGRATION_REGISTRY.map((def) => {
    const vendorKey = vendorEnumForId[def.id];
    const conn = vendorKey ? byVendor.get(vendorKey as (typeof connections)[0]["vendor"]) : undefined;
    return {
      def,
      conn: conn
        ? { status: conn.status, lastSyncAt: conn.lastSyncAt }
        : undefined,
    };
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Integrations"
        subtitle="Identity, finance, CRM, analytics, and legislative systems — adapter registry."
        backHref={`/${orgSlug}/enterprise`}
        backLabel="Enterprise AMS"
      />

      <div className="pp-ei-golive-strip pp-ei-golive-strip--admin" aria-label="Go-live steps">
        {ENTERPRISE_GO_LIVE_STEPS.map((step) => (
          <div
            key={step.id}
            className="pp-ei-golive-step"
            style={moduleCssVars(step.productId)}
          >
            <span className="pp-ei-golive-num">{step.step}</span>
            <div className="pp-ei-golive-body">
              <p className="pp-ei-golive-title">{step.title}</p>
              <p className="pp-ei-golive-detail">{step.detail}</p>
            </div>
            <span className={`pp-ei-status ${statusClass(step.statusTone)}`}>{step.statusLabel}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <MicrosoftConnectPanel
          orgSlug={orgSlug}
          connected={msConn?.status === "CONFIGURED"}
          lastSyncAt={msConn?.lastSyncAt?.toISOString() ?? null}
          initialThreads={msCfg.mailThreads ?? []}
          initialCalendar={msCfg.calendarEvents ?? []}
          initialContacts={msCfg.contacts ?? []}
        />
      </div>

      <div className="mt-6">
        <EasyDnnConnectPanel orgSlug={orgSlug} config={easyDnnConfig} />
      </div>

      <div className="mt-6">
        <ProtechGlExportPanel orgName={org.name} orgSlug={orgSlug} />
      </div>

      <div className="mt-8">
        <IntegrationRegistryGrid items={gridItems} />
      </div>
    </AdminPage>
  );
}
