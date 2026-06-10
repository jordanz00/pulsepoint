import Link from "next/link";
import type { AssociationDepartmentId } from "@/lib/association/departments";
import type { EnterpriseModule } from "@/lib/association/modules";
import type { IntegrationDefinition } from "@/lib/association/integrations";

const PHASE_LABEL: Record<string, string> = {
  live: "Live",
  alpha: "Alpha",
  foundation: "Foundation",
  roadmap: "Roadmap",
};

const PHASE_CLASS: Record<string, string> = {
  live: "badge-live",
  alpha: "badge-alpha",
  foundation: "badge-alpha",
  roadmap: "badge-roadmap",
};

export function EnterpriseHub({
  orgSlug,
  departments,
  modules,
  integrations,
  phaseCounts,
  stats,
}: {
  orgSlug: string;
  departments: Array<{ id: AssociationDepartmentId; name: string; shortName: string; description: string }>;
  modules: EnterpriseModule[];
  integrations: IntegrationDefinition[];
  phaseCounts: { live: number; alpha: number; foundation: number; roadmap: number };
  stats: {
    memberOrgCount: number;
    committeeCount: number;
    advocacyIssueCount: number;
    emergencyContactCount: number;
    integrationCount: number;
    memberCount: number;
  };
}) {
  return (
    <div className="pp-enterprise-hub space-y-6">
      <ul className="pp-enterprise-hub__stats" role="list">
        <GlassStat label="Members" value={stats.memberCount} />
        <GlassStat label="Hospital accounts" value={stats.memberOrgCount} />
        <GlassStat label="Committees" value={stats.committeeCount} />
        <GlassStat label="Advocacy issues" value={stats.advocacyIssueCount} />
        <GlassStat label="Emergency contacts" value={stats.emergencyContactCount} />
        <GlassStat label="Integrations" value={stats.integrationCount} />
      </ul>

      <div className="pp-enterprise-hub__phases">
        {Object.entries(phaseCounts).map(([phase, count]) => (
          <span key={phase} className={`${PHASE_CLASS[phase]} text-xs`}>
            {PHASE_LABEL[phase]} · {count}
          </span>
        ))}
      </div>

      <div className="pp-enterprise-hub__grid">
        <section className="pp-enterprise-hub__panel glass pp-glass-surface">
          <h2 className="pp-demo-panel-title">Association departments</h2>
          <p className="pp-demo-panel-sub">Operational areas aligned to hospital association requirements.</p>
          <ul className="pp-enterprise-hub__dept-list">
            {departments.map((d) => (
              <li key={d.id}>
                <Link href={`/${orgSlug}/enterprise/${d.id}`} className="pp-enterprise-hub__dept-link">
                  <span className="pp-enterprise-hub__dept-name">{d.name}</span>
                  <span className="pp-enterprise-hub__dept-desc">{d.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="pp-enterprise-hub__panel glass pp-glass-surface">
          <h2 className="pp-demo-panel-title">Enterprise modules</h2>
          <p className="pp-demo-panel-sub">Requirements 1–14 — live, alpha, and foundation phases.</p>
          <ul className="pp-enterprise-hub__module-list">
            {modules.map((m) => (
              <li key={m.id} className="pp-enterprise-hub__module-row">
                <div>
                  <span className="pp-enterprise-hub__module-title">{m.title}</span>
                  <p className="pp-enterprise-hub__module-summary">{m.summary}</p>
                </div>
                <span className={`shrink-0 ${PHASE_CLASS[m.phase]}`}>{PHASE_LABEL[m.phase]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="pp-enterprise-hub__panel glass pp-glass-surface">
        <div className="pp-demo-panel-head pp-demo-panel-head--inline">
          <div>
            <h2 className="pp-demo-panel-title">Quick links</h2>
            <p className="pp-demo-panel-sub">Hospital roster, advocacy, emergency, and integrations.</p>
          </div>
          <div className="pp-enterprise-hub__quick-links">
            <Link href={`/${orgSlug}/enterprise/governance`} className="pc-btn-secondary text-sm">
              Health system governance
            </Link>
            <Link href={`/${orgSlug}/enterprise/organizations`} className="pc-btn-secondary text-sm">
              Hospital accounts
            </Link>
            <Link href={`/${orgSlug}/enterprise/advocacy`} className="pc-btn-secondary text-sm">
              Advocacy
            </Link>
            <Link href={`/${orgSlug}/enterprise/emergency`} className="pc-btn-secondary text-sm">
              Emergency
            </Link>
            <Link href={`/${orgSlug}/enterprise/integrations`} className="pc-btn-secondary text-sm">
              Integrations
            </Link>
            <Link href={`/${orgSlug}/command-center`} className="pc-btn-primary text-sm">
              Command center
            </Link>
          </div>
        </div>
      </section>

      <section className="pp-enterprise-hub__panel glass pp-glass-surface">
        <h2 className="pp-demo-panel-title">Integration registry</h2>
        <p className="pp-demo-panel-sub">Vendors and connection status for your association stack.</p>
        <div className="pc-table-wrap mt-4">
          <table className="pc-table text-sm">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td className="capitalize">{i.category}</td>
                  <td>
                    <span className={PHASE_CLASS[i.status === "live" ? "live" : "roadmap"]}>
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function GlassStat({ label, value }: { label: string; value: number }) {
  return (
    <li>
      <article className="pp-enterprise-hub__stat glass pp-glass-surface">
        <p className="pp-ha-strip__label">{label}</p>
        <p className="pp-ha-strip__value">{value.toLocaleString()}</p>
      </article>
    </li>
  );
}
