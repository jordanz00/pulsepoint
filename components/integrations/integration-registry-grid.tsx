import { FeatureIcon } from "@/components/marketing/feature-icon";
import type { IntegrationDefinition } from "@/lib/association/integrations";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";
import { PRODUCT_MARKETING_ICONS } from "@/lib/suite-marketing";

export type IntegrationGridRow = {
  def: IntegrationDefinition;
  conn?: {
    status: string;
    lastSyncAt: Date | null;
  };
};

function integrationProductId(id: string): ProductId {
  const map: Record<string, ProductId> = {
    microsoft_365: "work",
    easydnn: "events",
    teams: "engage",
    stripe: "commerce",
    clerk: "work",
    resend: "engage",
    power_bi: "insights",
    tableau: "insights",
    salesforce: "crm",
    hubspot: "crm",
    netsuite: "commerce",
    quickbooks: "commerce",
    zoom: "events",
    lms: "learn",
    legislative_tracker: "advocacy",
  };
  return map[id] ?? "work";
}

function registryStatusTone(status: IntegrationDefinition["status"]): string {
  if (status === "live") return "pp-ei-status--live";
  if (status === "adapter_ready") return "pp-ei-status--pilot";
  return "pp-ei-status--shipped";
}

function registryStatusLabel(status: IntegrationDefinition["status"]): string {
  if (status === "live") return "Live";
  if (status === "adapter_ready") return "Adapter ready";
  if (status === "planned") return "Planned";
  return status;
}

function connectionLabel(conn: IntegrationGridRow["conn"]): { label: string; tone: string } {
  if (!conn) return { label: "Not configured", tone: "pp-ei-status--shipped" };
  const s = conn.status.toLowerCase();
  if (s === "configured" || s === "connected") {
    return { label: "Connected", tone: "pp-ei-status--live" };
  }
  if (s === "pending" || s === "error") {
    return { label: conn.status, tone: "pp-ei-status--pilot" };
  }
  return { label: conn.status, tone: "pp-ei-status--export" };
}

/** Glass integration cards — marketing parity for enterprise integrations admin. */
export function IntegrationRegistryGrid({ items }: { items: IntegrationGridRow[] }) {
  return (
    <div className="pp-ei-admin-wrap">
      <h2 className="pc-simple-section-title">Connected systems</h2>
      <p className="pc-simple-section-lead">
        Adapter registry with honest status — no secrets in repo. Configure vendors in panels above.
      </p>
      <div className="pp-ei-integration-grid pp-ei-integration-grid--admin" aria-label="Integration registry">
        {items.map(({ def, conn }) => {
          const productId = integrationProductId(def.id);
          const connUi = connectionLabel(conn);
          const icon = PRODUCT_MARKETING_ICONS[productId];

          return (
            <article
              key={def.id}
              className="pp-ei-integration-card pp-ei-integration-card--admin glass pp-glass-surface"
              style={moduleCssVars(productId)}
            >
              <FeatureIcon icon={icon} productId={productId} size="sm" />
              <div className="pp-ei-integration-body">
                <div className="pp-ei-integration-head">
                  <p className="pp-ei-integration-title">{def.name}</p>
                  <span className={`pp-ei-status ${registryStatusTone(def.status)}`}>
                    {registryStatusLabel(def.status)}
                  </span>
                </div>
                <p className="pp-ei-integration-text">{def.notes}</p>
                <p className="pp-ei-integration-it">
                  <span className={`pp-ei-status ${connUi.tone}`}>{connUi.label}</span>
                  {conn?.lastSyncAt
                    ? ` · Last sync ${conn.lastSyncAt.toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}`
                    : ""}
                  {def.adapterPath ? ` · ${def.adapterPath}` : ""}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
