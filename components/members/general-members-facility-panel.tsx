import Link from "next/link";
import { loadGeneralMembersByFacility } from "@/lib/general-members-by-facility";
import { GeneralMembersFacilityRoster } from "@/components/members/general-members-facility-roster";

export async function GeneralMembersFacilityPanel({
  orgId,
  orgSlug,
  compact = false,
}: {
  orgId: string;
  orgSlug: string;
  compact?: boolean;
}) {
  const snapshot = await loadGeneralMembersByFacility(orgId);

  return (
    <section
      className="mc-facility-roster-panel glass pp-glass-surface"
      aria-labelledby="general-facility-roster-title"
    >
      <header className="mc-facility-roster-panel-head">
        <div>
          <p className="mc-facility-roster-eyebrow">MemberCore · Roster</p>
          <h2 id="general-facility-roster-title" className="mc-facility-roster-title">
            Active general members by facility
          </h2>
          <p className="mc-facility-roster-sub">
            Sorted by healthcare facility type — hospitals, health networks, psychiatric and
            behavioral health centers, rehabilitation, cancer centers, and related accounts.
          </p>
        </div>
        <div className="mc-facility-roster-panel-actions">
          <Link href={`/${orgSlug}/enterprise/organizations`} className="pc-btn-secondary text-sm">
            Facility accounts
          </Link>
          <Link href={`/${orgSlug}/members`} className="pc-btn-primary text-sm">
            Full directory
          </Link>
        </div>
      </header>

      <GeneralMembersFacilityRoster orgSlug={orgSlug} snapshot={snapshot} compact={compact} />

      <p className="mc-facility-roster-foot">
        Data as of{" "}
        {snapshot.dataAsOf.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        . General membership class only; active status.
      </p>
    </section>
  );
}
