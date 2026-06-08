import Link from "next/link";
import { memberStatusLabel } from "@/lib/admin-page-copy";
import { ENGAGEMENT_TIER_LABEL, type EngagementTier } from "@/lib/engagement-score";
import { PREFERRED_CHANNEL_LABELS } from "@/lib/member-profile/extended-fields";
import type { MemberProfileData } from "@/lib/member-profile/types";
import { MemberProfileDetailsForm } from "@/components/members/member-profile-details-form";
import { MemberRolesPanel } from "@/components/members/member-roles-panel";
import { MemberNotes } from "@/components/members/member-notes";
import { MemberPulsePanel } from "@/components/members/member-pulse-panel";
import { Member360Panel } from "@/components/members/member-360-panel";
import { Member360Timeline } from "@/components/members/member-360-timeline";
import { Badge } from "@/components/ui/badge";
import { MemberProfileSectionJump } from "@/components/members/member-profile-section-jump";
import {
  countActiveRegistrations,
  ONE_SCREEN_RECENT_NOTES_MAX,
  recentRegistrations,
} from "@/lib/member-profile/one-screen";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Empty({ message }: { message: string }) {
  return <p className="mc-profile-empty">{message}</p>;
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mc-profile-table-wrap">
      <table className="mc-profile-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function buildMemberProfilePanels({
  data,
  orgSlug,
  readOnly,
  membershipCard,
}: {
  data: MemberProfileData;
  orgSlug: string;
  readOnly: boolean;
  membershipCard?: React.ReactNode;
}) {
  const { member, contact, profile360 } = data;
  const fullName = `${member.firstName} ${member.lastName}`;

  const pendingRegs = countActiveRegistrations(data.registrations);
  const recentRegs = recentRegistrations(data.registrations);

  const summary = (
    <section className="mc-profile-one-screen space-y-8">
      <div className="mc-profile-kpi-row pc-stat-grid">
        <Kpi label="Status" value={memberStatusLabel(member.status as "ACTIVE" | "INACTIVE" | "LAPSED")} />
        <Kpi
          label="Engagement"
          value={
            profile360
              ? `${profile360.engagementScore} · ${ENGAGEMENT_TIER_LABEL[profile360.engagementTier as EngagementTier]}`
              : `${member.engagementScore}`
          }
        />
        <Kpi label="Registrations" value={String(pendingRegs)} />
        <Kpi label="Open invoices" value={String(data.invoices.filter((o) => o.status === "PENDING").length)} />
      </div>

      <div className="mc-profile-grid-2">
        <div className="mc-profile-card pp-readable-on-light">
          <h3 className="mc-profile-card-title">At a glance</h3>
          <dl className="mc-profile-dl">
            <Dt label="Email" value={member.email ?? "—"} />
            <Dt label="Phone" value={member.phone ?? "—"} />
            <Dt label="Organization" value={member.organizationName ?? member.company ?? "—"} />
            <Dt label="Title" value={member.jobTitle ?? "—"} />
            <Dt label="Tier" value={member.tierName ?? "—"} />
            <Dt label="Renewal" value={formatDate(member.renewalDueAt)} />
            <Dt label="Joined" value={formatDate(member.joinedAt)} />
            <Dt label="Next follow-up" value={formatDate(member.nextFollowUpAt)} />
          </dl>
        </div>
        <div className="mc-profile-card pp-readable-on-light">
          {membershipCard ?? (
            <p className="mc-profile-hint">Membership card loads from the member record.</p>
          )}
        </div>
      </div>

      <div className="mc-profile-card pp-readable-on-light">
        <div className="mc-profile-card-head">
          <h3 className="mc-profile-card-title">Tags</h3>
          {!readOnly ? (
            <MemberProfileSectionJump tab="admin">Edit membership →</MemberProfileSectionJump>
          ) : null}
        </div>
        {data.tags.length > 0 ? (
          <div className="mc-profile-tags" role="list">
            {data.tags.map((t) => (
              <span key={t} className="mc-profile-tag" role="listitem">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="mc-profile-empty">
            No tags yet.
            {!readOnly ? (
              <>
                {" "}
                <MemberProfileSectionJump tab="admin">Add on Admin tab →</MemberProfileSectionJump>
              </>
            ) : null}
          </p>
        )}
      </div>

      <div className="mc-profile-one-screen-split">
        <div className="mc-profile-card pp-readable-on-light">
          <div className="mc-profile-card-head">
            <h3 className="mc-profile-card-title">Event registrations</h3>
            <MemberProfileSectionJump tab="meetings">All meetings →</MemberProfileSectionJump>
          </div>
          {recentRegs.length === 0 ? (
            <p className="mc-profile-empty">
              No registrations yet.{" "}
              <Link href={`/${orgSlug}/events`} className="mc-profile-link">
                Publish an event →
              </Link>
            </p>
          ) : (
            <div className="pc-table-wrap">
              <table className="pc-table mc-profile-table-compact">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegs.map((r) => (
                    <tr key={r.id}>
                      <td className="min-w-0">
                        <Link
                          href={`/${orgSlug}/events/${r.eventId}`}
                          className="mc-profile-link truncate"
                        >
                          {r.eventTitle}
                        </Link>
                      </td>
                      <td>{r.status}</td>
                      <td>{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mc-profile-card pp-readable-on-light">
          <MemberNotes
            orgSlug={orgSlug}
            memberId={member.id}
            variant="compact"
            initialNotes={contact.notes.map((n) => ({
              id: n.id,
              body: n.body,
              createdAt: n.createdAt,
              authorName: n.authorName,
            }))}
          />
          {contact.notes.length > ONE_SCREEN_RECENT_NOTES_MAX ? (
            <div className="mc-profile-card-actions">
              <MemberProfileSectionJump tab="notes">All notes →</MemberProfileSectionJump>
            </div>
          ) : null}
        </div>
      </div>

      {data.extended.credentials ? (
        <p className="mc-profile-hint">
          Credentials: {data.extended.credentials}
          {data.extended.licenseState ? ` · License state ${data.extended.licenseState}` : ""}
        </p>
      ) : null}
    </section>
  );

  const address = (
    <section className="mc-profile-section">
      <p className="mc-profile-lead">
        Mailing address and location on file for {fullName}. Used for directories, badges, and renewal mailings.
      </p>
      <MemberProfileDetailsForm
        orgSlug={orgSlug}
        memberId={member.id}
        extended={data.extended}
        section="address"
        readOnly={readOnly}
      />
    </section>
  );

  const roles = (
    <section className="mc-profile-section">
      <p className="mc-profile-lead">
        Organization roles — leadership, board, and committee assignments tied to this member.
      </p>
      <MemberRolesPanel orgSlug={orgSlug} memberId={member.id} initialRoles={data.roles} />
    </section>
  );

  const committees = (
    <section className="mc-profile-section">
      <p className="mc-profile-lead">Standing and advisory committee memberships.</p>
      {data.committees.length === 0 ? (
        <Empty message="No committee memberships on file." />
      ) : (
        <DataTable
          headers={["Committee", "Role", "Term", "Status"]}
          rows={data.committees.map((c) => [
            <Link key={c.id} href={`/${orgSlug}/committees`} className="mc-profile-link">
              {c.committeeName}
            </Link>,
            c.title,
            c.termStart
              ? `${formatDate(c.termStart)} – ${formatDate(c.termEnd)}`
              : "—",
            c.isCurrent ? (
              <Badge variant="live">Current</Badge>
            ) : (
              <Badge variant="neutral">Past</Badge>
            ),
          ])}
        />
      )}
    </section>
  );

  const roster = (
    <section className="mc-profile-section">
      <p className="mc-profile-lead">
        {member.organizationName
          ? `Other active general members at ${member.organizationName} and peers on the facility roster.`
          : "Link this member to a healthcare facility account (hospital, network, cancer center, behavioral health, etc.) to see roster peers."}
      </p>
      {data.rosterPeers.length === 0 ? (
        <Empty message="No roster peers — assign an organization on the Admin tab." />
      ) : (
        <DataTable
          headers={["Name", "Title", "Email", "Status"]}
          rows={data.rosterPeers.map((p) => [
            <Link key={p.id} href={`/${orgSlug}/members/${p.id}`} className="mc-profile-link">
              {p.firstName} {p.lastName}
            </Link>,
            p.jobTitle ?? "—",
            p.email ?? "—",
            memberStatusLabel(p.status as "ACTIVE" | "INACTIVE" | "LAPSED"),
          ])}
        />
      )}
    </section>
  );

  const engagement = (
    <section className="mc-profile-section space-y-6">
      <MemberPulsePanel orgSlug={orgSlug} memberId={member.id} pulse={data.pulse} />
      {profile360 ? (
        <Member360Panel orgSlug={orgSlug} profile={profile360} dbBadges={data.memberBadges} />
      ) : (
        <Empty message="Engagement timeline not loaded." />
      )}
    </section>
  );

  const meetings = (
    <section className="mc-profile-section">
      <p className="mc-profile-lead">Event and meeting registrations (EventCore).</p>
      {data.registrations.length === 0 ? (
        <Empty message="No meeting registrations yet." />
      ) : (
        <DataTable
          headers={["Event", "Status", "Registered", "Paid / check-in"]}
          rows={data.registrations.map((r) => [
            <Link key={r.id} href={`/${orgSlug}/events/${r.eventId}`} className="mc-profile-link">
              {r.eventTitle}
            </Link>,
            r.status,
            formatDate(r.createdAt),
            r.checkedInAt
              ? `Checked in ${formatDate(r.checkedInAt)}`
              : r.paidAt
                ? `Paid ${formatDate(r.paidAt)}`
                : "—",
          ])}
        />
      )}
    </section>
  );

  const billing = (
    <section className="mc-profile-section space-y-6">
      <MemberProfileDetailsForm
        orgSlug={orgSlug}
        memberId={member.id}
        extended={data.extended}
        section="billing"
        readOnly={readOnly}
      />
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Subscriptions</h3>
        {data.subscriptions.length === 0 ? (
          <Empty message="No active subscription records." />
        ) : (
          <DataTable
            headers={["Plan", "Interval", "Next bill", "Status"]}
            rows={data.subscriptions.map((s) => [
              s.tierName ?? s.productName ?? "Membership",
              s.billingInterval,
              formatDate(s.nextBillAt),
              s.status,
            ])}
          />
        )}
      </div>
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Invoices & dues orders</h3>
        {data.invoices.length === 0 ? (
          <Empty message="No invoices or dues orders on file." />
        ) : (
          <DataTable
            headers={["Date", "Items", "Total", "Status"]}
            rows={data.invoices.map((o) => [
              formatDate(o.createdAt),
              o.lines.map((l) => l.productName).join(", "),
              formatUsd(o.totalCents),
              o.status,
            ])}
          />
        )}
        <Link href={`/${orgSlug}/commerce`} className="mc-profile-inline-link">
          Open Commerce →
        </Link>
      </div>
    </section>
  );

  const comms = (
    <section className="mc-profile-section space-y-6">
      <MemberProfileDetailsForm
        orgSlug={orgSlug}
        memberId={member.id}
        extended={data.extended}
        section="comms"
        readOnly={readOnly}
      />
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Recent email (Engage)</h3>
        {profile360 && profile360.activities.some((a) => a.kind === "email") ? (
          <ul className="mc-profile-list">
            {profile360.activities
              .filter((a) => a.kind === "email")
              .slice(0, 8)
              .map((a) => (
                <li key={a.id}>
                  <span className="font-medium">{a.title}</span>
                  <span className="text-[var(--text-muted)]"> · {formatDate(a.at)}</span>
                </li>
              ))}
          </ul>
        ) : (
          <Empty message="No logged email sends for this member." />
        )}
      </div>
      {!readOnly ? null : (
        <p className="mc-profile-hint">
          Preferred:{" "}
          {PREFERRED_CHANNEL_LABELS[data.extended.communicationPreferences.preferredChannel]}
        </p>
      )}
    </section>
  );

  const web = (
    <section className="mc-profile-section">
      <div className="mc-profile-grid-2">
        <div className="mc-profile-card">
          <h3 className="mc-profile-card-title">Web & social</h3>
          <dl className="mc-profile-dl">
            <Dt
              label="LinkedIn"
              value={
                member.linkedInUrl ? (
                  <a href={member.linkedInUrl} className="mc-profile-link" target="_blank" rel="noreferrer">
                    {member.linkedInUrl}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Dt
              label="Website"
              value={
                member.websiteUrl ? (
                  <a href={member.websiteUrl} className="mc-profile-link" target="_blank" rel="noreferrer">
                    {member.websiteUrl}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </dl>
        </div>
        <div className="mc-profile-card">
          <h3 className="mc-profile-card-title">Capture sources</h3>
          {contact.sources.length === 0 ? (
            <Empty message="No web or form capture sources." />
          ) : (
            <ul className="mc-profile-list">
              {contact.sources.map((s) => (
                <li key={s.id}>
                  <span className="font-medium">{s.label}</span>
                  <span className="text-[var(--text-muted)]">
                    {" "}
                    · {s.sourceKind} · {formatDate(s.capturedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );

  const notes = (
    <section className="mc-profile-section">
      <MemberNotes
        orgSlug={orgSlug}
        memberId={member.id}
        initialNotes={contact.notes.map((n) => ({
          id: n.id,
          body: n.body,
          createdAt: n.createdAt,
          authorName: n.authorName,
        }))}
      />
    </section>
  );

  const crm = (
    <section className="mc-profile-section space-y-6">
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Opportunities (deals)</h3>
        {contact.deals.length === 0 ? (
          <Empty message="No open opportunities." />
        ) : (
          <DataTable
            headers={["Deal", "Pipeline", "Stage", "Amount", "Updated"]}
            rows={contact.deals.map((d) => [
              d.title,
              d.pipelineName,
              d.stage,
              formatUsd(d.amountCents),
              formatDate(d.updatedAt),
            ])}
          />
        )}
        <Link href={`/${orgSlug}/crm/deals`} className="mc-profile-inline-link">
          CRM pipeline →
        </Link>
      </div>
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Active workflows</h3>
        {contact.workflowRuns.length === 0 ? (
          <Empty message="No active CRM workflows." />
        ) : (
          <ul className="mc-profile-list">
            {contact.workflowRuns.map((w) => (
              <li key={w.id}>
                <span className="font-medium">{w.workflowName}</span>
                <span className="text-[var(--text-muted)]"> · {w.stageLabel}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );

  const leads = (
    <section className="mc-profile-section space-y-6">
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Leads & capture</h3>
        {contact.sources.length === 0 ? (
          <Empty message="No lead sources recorded." />
        ) : (
          <DataTable
            headers={["Source", "Kind", "Captured"]}
            rows={contact.sources.map((s) => [s.label, s.sourceKind, formatDate(s.capturedAt)])}
          />
        )}
      </div>
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Relationships</h3>
        {contact.relationships.length === 0 ? (
          <Empty message="No related contacts." />
        ) : (
          <ul className="mc-profile-list">
            {contact.relationships.map((r) => (
              <li key={r.id}>
                <Link href={`/${orgSlug}/members/${r.otherMemberId}`} className="mc-profile-link">
                  {r.label}
                </Link>
                <span className="text-[var(--text-muted)]"> · {r.relationType}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );

  const education = (
    <section className="mc-profile-section space-y-6">
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Education activities</h3>
        {data.enrollments.length === 0 ? (
          <Empty message="No course enrollments." />
        ) : (
          <DataTable
            headers={["Course", "Status", "Enrolled", "Completed"]}
            rows={data.enrollments.map((e) => [
              e.courseTitle,
              e.status,
              formatDate(e.enrolledAt),
              formatDate(e.completedAt),
            ])}
          />
        )}
        <Link href={`/${orgSlug}/learn`} className="mc-profile-inline-link">
          Learning catalog →
        </Link>
      </div>
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">CE credits awarded</h3>
        {data.ceAwards.length === 0 ? (
          <Empty message="No CE credit awards." />
        ) : (
          <DataTable
            headers={["Credits", "Type", "Source", "Awarded"]}
            rows={data.ceAwards.map((a) => [
              String(a.amount),
              a.creditCode,
              a.source,
              formatDate(a.awardedAt),
            ])}
          />
        )}
      </div>
    </section>
  );

  const store = (
    <section className="mc-profile-section space-y-6">
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Store & merchandise</h3>
        {data.storeOrders.length === 0 ? (
          <Empty message="No store purchases." />
        ) : (
          <DataTable
            headers={["Date", "Items", "Total", "Status"]}
            rows={data.storeOrders.map((o) => [
              formatDate(o.createdAt),
              o.lines.map((l) => l.productName).join(", "),
              formatUsd(o.totalCents),
              o.status,
            ])}
          />
        )}
      </div>
      <div className="mc-profile-card">
        <h3 className="mc-profile-card-title">Gift certificates</h3>
        {data.giftCertificates.length === 0 ? (
          <Empty message="No gift certificate purchases on file." />
        ) : (
          <DataTable
            headers={["Date", "Product", "Total", "Status"]}
            rows={data.giftCertificates.map((o) => [
              formatDate(o.createdAt),
              o.lines.map((l) => l.productName).join(", "),
              formatUsd(o.totalCents),
              o.status,
            ])}
          />
        )}
      </div>
    </section>
  );

  const activity = (
    <section className="mc-profile-section">
      <p className="mc-profile-lead">
        Related transactions and touchpoints across events, commerce, giving, learning, email, and notes.
      </p>
      {profile360 ? (
        <Member360Timeline activities={profile360.activities} />
      ) : (
        <Empty message="No activity loaded." />
      )}
    </section>
  );

  return {
    summary,
    address,
    roles,
    committees,
    roster,
    engagement,
    meetings,
    billing,
    comms,
    web,
    notes,
    crm,
    leads,
    education,
    store,
    activity,
  };
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="mc-profile-kpi">
      <p className="mc-profile-kpi-label">{label}</p>
      <p className="mc-profile-kpi-value">{value}</p>
    </div>
  );
}

function Dt({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
