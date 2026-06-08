import type { ReactNode } from "react";
import type { MemberProfileData, MemberProfileTab } from "@/lib/member-profile/types";
import { MemberProfileShell } from "@/components/members/member-profile-shell";
import { buildMemberProfilePanels } from "@/components/members/member-profile-panels";
import { MemberProfileDetailsForm } from "@/components/members/member-profile-details-form";
import { MemberForm } from "@/components/members/member-form";
import { MemberRolesPanel } from "@/components/members/member-roles-panel";
import type { loadMemberFormOptions } from "@/lib/member-form-options";

type MemberFormOptions = Awaited<ReturnType<typeof loadMemberFormOptions>>;

export function MemberProfileView({
  data,
  orgSlug,
  easy = false,
  formOptions,
  memberFormInitial,
  summaryHeader,
  membershipCard,
}: {
  data: MemberProfileData;
  orgSlug: string;
  easy?: boolean;
  formOptions?: MemberFormOptions;
  memberFormInitial?: React.ComponentProps<typeof MemberForm>["initial"];
  summaryHeader?: ReactNode;
  membershipCard?: ReactNode;
}) {
  const readOnly = easy;
  const basePanels = buildMemberProfilePanels({
    data,
    orgSlug,
    readOnly,
    membershipCard,
  });

  const admin = easy ? (
    <section className="mc-profile-section">
      <p className="mc-profile-lead">
        Switch to full admin mode for membership settings and role editing.
      </p>
      <MemberProfileDetailsForm
        orgSlug={orgSlug}
        memberId={data.member.id}
        extended={data.extended}
        section="other"
        readOnly
      />
    </section>
  ) : (
    <section className="mc-profile-section space-y-8">
      <MemberProfileDetailsForm
        orgSlug={orgSlug}
        memberId={data.member.id}
        extended={data.extended}
        section="other"
        readOnly={false}
      />
      {formOptions && memberFormInitial ? (
        <div className="mc-profile-card">
          <h3 className="mc-profile-card-title">Membership record</h3>
          <MemberForm
            orgSlug={orgSlug}
            memberId={data.member.id}
            tiers={formOptions.tiers}
            organizations={formOptions.organizations}
            initial={memberFormInitial}
          />
        </div>
      ) : null}
      <MemberRolesPanel
        orgSlug={orgSlug}
        memberId={data.member.id}
        initialRoles={data.roles}
      />
    </section>
  );

  const panels: Record<MemberProfileTab, ReactNode> = {
    ...basePanels,
    admin,
  };

  return (
    <MemberProfileShell
      easy={easy}
      summary={summaryHeader}
      panels={panels}
    />
  );
}
