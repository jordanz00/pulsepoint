import Link from "next/link";
import type { HealthSystemGovernanceData, HealthSystemTreeNode } from "@/lib/enterprise/health-system-governance";

export function HealthSystemGovernanceDashboard({
  orgSlug,
  data,
}: {
  orgSlug: string;
  data: HealthSystemGovernanceData;
}) {
  const { summary, trees, orphanHospitals } = data;

  return (
    <div className="pp-health-governance space-y-6">
      <ul className="pp-enterprise-hub__stats" role="list">
        <GovernanceStat label="Health systems" value={summary.healthSystems} />
        <GovernanceStat label="Hospitals" value={summary.hospitals} />
        <GovernanceStat label="Unlinked hospitals" value={summary.unlinkedHospitals} />
        <GovernanceStat label="Roster members" value={summary.totalMembersOnRoster} />
        <GovernanceStat label="Governance roles" value={summary.governanceRoleCount} />
        <GovernanceStat label="Active committees" value={summary.activeCommittees} />
        <GovernanceStat label="C-suite on roster" value={summary.cSuiteOnRoster} />
      </ul>

      <p className="text-sm text-zinc-500">
        Data as of {summary.asOf}. Parent-child hierarchy from hospital accounts; governance roles
        from MemberCore. Alpha — not a certified compliance workflow.
      </p>

      <section className="pp-enterprise-hub__panel glass pp-glass-surface">
        <h2 className="pp-demo-panel-title">Health system hierarchy</h2>
        <p className="pp-demo-panel-sub">
          Multi-hospital systems with subsidiary hospitals rolled up under parent accounts.
        </p>
        {trees.length > 0 ? (
          <ul className="pp-health-governance__trees">
            {trees.map((tree) => (
              <HealthSystemTree key={tree.id} node={tree} orgSlug={orgSlug} depth={0} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            No health system parent accounts yet.{" "}
            <Link href={`/${orgSlug}/enterprise/organizations/new`} className="pc-link">
              Add a HEALTH_SYSTEM account
            </Link>{" "}
            and link hospitals as children.
          </p>
        )}
      </section>

      {orphanHospitals.length > 0 ? (
        <section className="pp-enterprise-hub__panel glass pp-glass-surface">
          <h2 className="pp-demo-panel-title">Standalone hospitals</h2>
          <p className="pp-demo-panel-sub">
            Facilities without a parent health system — {orphanHospitals.length} account
            {orphanHospitals.length === 1 ? "" : "s"}.
          </p>
          <ul className="pp-health-governance__orphans">
            {orphanHospitals.slice(0, 24).map((h) => (
              <li key={h.id}>
                <Link
                  href={`/${orgSlug}/enterprise/organizations/${h.id}`}
                  className="pp-health-governance__orphan-link"
                >
                  <span>{h.name}</span>
                  <span className="pp-health-governance__meta">
                    {h.type.replace(/_/g, " ")} · {h.memberCount} members
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href={`/${orgSlug}/committees`} className="pc-btn-secondary text-sm">
          Committees & governance
        </Link>
        <Link href={`/${orgSlug}/enterprise/organizations`} className="pc-btn-secondary text-sm">
          Hospital accounts
        </Link>
        <Link href={`/${orgSlug}/members/analytics`} className="pc-btn-secondary text-sm">
          Membership analytics
        </Link>
      </div>
    </div>
  );
}

function GovernanceStat({ label, value }: { label: string; value: number }) {
  return (
    <li>
      <article className="pp-enterprise-hub__stat glass pp-glass-surface">
        <p className="pp-ha-strip__label">{label}</p>
        <p className="pp-ha-strip__value">{value.toLocaleString()}</p>
      </article>
    </li>
  );
}

function HealthSystemTree({
  node,
  orgSlug,
  depth,
}: {
  node: HealthSystemTreeNode;
  orgSlug: string;
  depth: number;
}) {
  return (
    <li className="pp-health-governance__tree-node" style={{ marginLeft: depth * 16 }}>
      <div className="pp-health-governance__tree-row">
        <Link
          href={`/${orgSlug}/enterprise/organizations/${node.id}`}
          className="pp-health-governance__tree-link"
        >
          <strong>{node.name}</strong>
        </Link>
        <span className="pp-health-governance__meta">
          {node.type.replace(/_/g, " ")} · {node.memberCount} members · {node.childCount}{" "}
          {node.childCount === 1 ? "subsidiary" : "subsidiaries"}
        </span>
      </div>
      {node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <HealthSystemTree key={child.id} node={child} orgSlug={orgSlug} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
