import type { ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Award,
  CalendarDays,
  CreditCard,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import type { PortalDashboard } from "@/lib/portal/load-portal-dashboard";
import { PortalProfileForm } from "@/components/portal/portal-profile-form";
import { PortalQuickNav } from "@/components/portal/portal-quick-nav";
import { PortalOrderPayButton } from "@/components/portal/portal-order-pay-button";
import { PortalRenewButton } from "@/components/portal/portal-renew-button";
import { PortalTranscriptExportButton } from "@/components/portal/portal-transcript-export-button";

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function SectionShell({
  id,
  icon,
  title,
  stat,
  action,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  stat?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="portal-section ds-card ds-glass">
      <header className="portal-section__head">
        <div className="portal-section__icon" aria-hidden>
          {icon}
        </div>
        <div className="portal-section__titles">
          <h2 className="portal-section__title">{title}</h2>
          {stat ? <p className="portal-section__stat">{stat}</p> : null}
        </div>
        {action}
      </header>
      <div className="portal-section__body">{children}</div>
    </section>
  );
}

function EmptyState({ message, cta }: { message: string; cta?: ReactNode }) {
  return (
    <div className="portal-empty">
      <p>{message}</p>
      {cta}
    </div>
  );
}

export function PortalHub({
  orgSlug,
  data,
  renewed,
  renewalCancelled,
}: {
  orgSlug: string;
  data: PortalDashboard;
  renewed?: boolean;
  renewalCancelled?: boolean;
}) {
  const { member } = data;
  const greeting = member.firstName ? `Welcome back, ${member.firstName}` : "Welcome back";

  return (
    <div className="portal-hub pp-route-enter">
      {renewed ? (
        <p className="portal-renewal-banner portal-renewal-banner--success ds-card">
          Renewal payment received — your membership date has been extended.
        </p>
      ) : null}
      {renewalCancelled ? (
        <p className="portal-renewal-banner portal-renewal-banner--muted ds-card">
          Renewal checkout was cancelled. You can pay anytime from this page.
        </p>
      ) : null}
      <header className="portal-hero">
        <div className="portal-hero__copy">
          <p className="portal-hero__eyebrow">{data.orgName}</p>
          <h1 className="portal-hero__title">{greeting}</h1>
          <p className="portal-hero__lead">
            Everything about your membership in one place — no hunting through menus.
          </p>
        </div>
        <div className="portal-hero__card ds-card ds-glass">
          <p className="portal-hero__card-label">Membership</p>
          <p className="portal-hero__card-tier">{member.tierName ?? "Member"}</p>
          <p className="portal-hero__card-status">{member.status.toLowerCase()}</p>
          {member.renewalLabel ? (
            <span
              className={`portal-hero__renewal portal-hero__renewal--${member.renewalTone ?? "ok"}`}
            >
              {member.renewalLabel}
            </span>
          ) : null}
        </div>
      </header>

      <PortalQuickNav orgSlug={orgSlug} />

      <div className="portal-hub__sections">
        <SectionShell
          id="membership"
          icon={<Shield size={22} strokeWidth={1.75} />}
          title="My membership"
          stat={
            member.tierPriceCents
              ? `${member.tierName} · ${fmtUsd(member.tierPriceCents)}/yr`
              : `Member since ${format(member.joinedAt, "MMM yyyy")}`
          }
          action={
            member.renewalTone === "risk" || member.renewalTone === "warn" ? (
              <PortalRenewButton orgSlug={orgSlug} label="Pay renewal" />
            ) : null
          }
        >
          <dl className="portal-membership-grid">
            <div>
              <dt>Status</dt>
              <dd>{member.status}</dd>
            </div>
            <div>
              <dt>Dues tier</dt>
              <dd>{member.tierName ?? "Not assigned"}</dd>
            </div>
            <div>
              <dt>Renewal</dt>
              <dd>
                {member.renewalDueAt
                  ? format(member.renewalDueAt, "MMM d, yyyy")
                  : "Not scheduled"}
              </dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{format(member.joinedAt, "MMM d, yyyy")}</dd>
            </div>
          </dl>
          <details className="portal-profile-details">
            <summary>Edit profile</summary>
            <PortalProfileForm
              orgSlug={orgSlug}
              initial={{
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email ?? undefined,
                phone: member.phone ?? undefined,
              }}
            />
          </details>
        </SectionShell>

        <SectionShell
          id="events"
          icon={<CalendarDays size={22} strokeWidth={1.75} />}
          title="My events"
          stat={
            data.events.upcoming.length > 0
              ? `${data.events.upcoming.length} upcoming`
              : `${data.events.total} total registrations`
          }
          action={
            <Link href={`/${orgSlug}/calendar`} className="portal-section__link">
              Browse events
            </Link>
          }
        >
          {data.events.upcoming.length === 0 && data.events.recent.length === 0 ? (
            <EmptyState
              message="No event registrations yet."
              cta={
                <Link href={`/${orgSlug}/calendar`} className="ds-btn ds-btn--ghost ds-btn--sm">
                  Find an event
                </Link>
              }
            />
          ) : (
            <>
              {data.events.upcoming.length > 0 ? (
                <ul className="portal-list">
                  {data.events.upcoming.map((r) => (
                    <li key={r.id} className="portal-list__item">
                      <div>
                        <p className="portal-list__title">{r.event.title}</p>
                        <p className="portal-list__meta">
                          {format(r.event.startsAt, "EEE, MMM d · h:mm a")}
                          {r.paidAt ? " · Paid" : ""}
                        </p>
                      </div>
                      <Link
                        href={`/${orgSlug}/e/${r.event.publicSlug}`}
                        className="portal-list__action"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              {data.events.recent.length > 0 ? (
                <>
                  <p className="portal-list__group-label">Recent</p>
                  <ul className="portal-list">
                    {data.events.recent.map((r) => (
                      <li key={r.id} className="portal-list__item portal-list__item--muted">
                        <div>
                          <p className="portal-list__title">{r.event.title}</p>
                          <p className="portal-list__meta">
                            {format(r.event.startsAt, "MMM d, yyyy")} · {r.status}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
        </SectionShell>

        <SectionShell
          id="committees"
          icon={<Users size={22} strokeWidth={1.75} />}
          title="My committees"
          stat={
            data.committees.length > 0
              ? `${data.committees.length} active role${data.committees.length === 1 ? "" : "s"}`
              : "No committee assignments"
          }
        >
          {data.committees.length === 0 ? (
            <EmptyState message="You are not on a committee roster yet. Contact staff to volunteer." />
          ) : (
            <ul className="portal-list">
              {data.committees.map((c) => (
                <li key={c.id} className="portal-list__item">
                  <div>
                    <p className="portal-list__title">{c.committeeName}</p>
                    <p className="portal-list__meta">
                      {c.title}
                      {c.termEnd ? ` · Term ends ${format(c.termEnd, "MMM yyyy")}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionShell>

        <SectionShell
          id="certifications"
          icon={<Award size={22} strokeWidth={1.75} />}
          title="My certifications"
          stat={
            data.certifications.totalCredits > 0
              ? `${data.certifications.totalCredits} CE credits earned`
              : `${data.certifications.enrollments.length} enrollment${data.certifications.enrollments.length === 1 ? "" : "s"}`
          }
          action={
            <PortalTranscriptExportButton
              orgSlug={orgSlug}
              memberName={`${member.firstName} ${member.lastName}`.trim()}
            />
          }
        >
          {data.certifications.enrollments.length === 0 &&
          data.certifications.awards.length === 0 ? (
            <EmptyState message="No courses or certificates yet. CE enrollments appear here when you register." />
          ) : (
            <>
              {data.certifications.enrollments.length > 0 ? (
                <ul className="portal-list">
                  {data.certifications.enrollments.slice(0, 4).map((e) => (
                    <li key={e.id} className="portal-list__item">
                      <div>
                        <p className="portal-list__title">{e.course.title}</p>
                        <p className="portal-list__meta">
                          {e.status.toLowerCase()}
                          {e.course.creditAmount ? ` · ${e.course.creditAmount} credits` : ""}
                          {e.completedAt
                            ? ` · Completed ${format(e.completedAt, "MMM d, yyyy")}`
                            : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              {data.certifications.awards.length > 0 ? (
                <>
                  <p className="portal-list__group-label">Credit awards</p>
                  <ul className="portal-list">
                    {data.certifications.awards.slice(0, 4).map((a) => (
                      <li key={a.id} className="portal-list__item portal-list__item--muted">
                        <div>
                          <p className="portal-list__title">
                            {a.amount} {a.creditCode} credits
                          </p>
                          <p className="portal-list__meta">
                            {format(a.awardedAt, "MMM d, yyyy")}
                            {a.note ? ` · ${a.note}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
        </SectionShell>

        <SectionShell
          id="invoices"
          icon={<CreditCard size={22} strokeWidth={1.75} />}
          title="My invoices"
          stat={
            data.invoices.pendingCount > 0
              ? `${data.invoices.pendingCount} due · ${fmtUsd(data.invoices.totalPaidCents)} paid to date`
              : data.invoices.orders.length > 0
                ? `${fmtUsd(data.invoices.totalPaidCents)} paid to date`
                : "No orders yet"
          }
          action={
            <Link href={`/${orgSlug}/portal/store`} className="portal-section__link">
              Store
            </Link>
          }
        >
          {data.invoices.orders.length === 0 ? (
            <EmptyState
              message="No invoices or orders on file."
              cta={
                <Link href={`/${orgSlug}/portal/store`} className="ds-btn ds-btn--ghost ds-btn--sm">
                  Visit store
                </Link>
              }
            />
          ) : (
            <ul className="portal-list">
              {[...data.invoices.orders]
                .sort((a, b) => {
                  if (a.status === "PENDING" && b.status !== "PENDING") return -1;
                  if (b.status === "PENDING" && a.status !== "PENDING") return 1;
                  return b.createdAt.getTime() - a.createdAt.getTime();
                })
                .slice(0, 6)
                .map((o) => (
                  <li
                    key={o.id}
                    className={`portal-list__item${o.status === "PENDING" ? " portal-list__item--due" : ""}`}
                  >
                    <div className="portal-invoice-row__copy">
                      <p className="portal-list__title">
                        {o.invoiceNumber} · {fmtUsd(o.totalCents)}
                      </p>
                      <p className="portal-list__meta">
                        <span
                          className={`portal-invoice-status portal-invoice-status--${o.status.toLowerCase()}`}
                        >
                          {o.status.toLowerCase()}
                        </span>
                        {o.paidAt ? ` · Paid ${format(o.paidAt, "MMM d, yyyy")}` : ""}
                        {o.items.length > 0
                          ? ` · ${o.items.map((i) => i.name).join(", ")}`
                          : ""}
                      </p>
                    </div>
                    {o.status === "PENDING" ? (
                      <PortalOrderPayButton
                        orgSlug={orgSlug}
                        orderId={o.id}
                        amountLabel={fmtUsd(o.totalCents)}
                      />
                    ) : null}
                  </li>
                ))}
            </ul>
          )}
        </SectionShell>

        <SectionShell
          id="activity"
          icon={<MessageCircle size={22} strokeWidth={1.75} />}
          title="My community activity"
          stat={
            data.community.spaceCount > 0
              ? `${data.community.spaceCount} space${data.community.spaceCount === 1 ? "" : "s"}`
              : "Not in any communities"
          }
          action={
            <Link href={`/${orgSlug}/portal/communities`} className="portal-section__link">
              All spaces
            </Link>
          }
        >
          {data.community.spaces.length === 0 && data.community.recentPosts.length === 0 ? (
            <EmptyState message="Join a committee or chapter space to see updates here." />
          ) : (
            <>
              {data.community.spaces.length > 0 ? (
                <ul className="portal-space-chips">
                  {data.community.spaces.slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/${orgSlug}/portal/communities/${s.id}`}
                        className="portal-space-chip"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              {data.community.recentPosts.length > 0 ? (
                <>
                  <p className="portal-list__group-label">Recent updates</p>
                  <ul className="portal-list">
                    {data.community.recentPosts.map((p) => (
                      <li key={p.id} className="portal-list__item">
                        <div>
                          <p className="portal-list__title">{p.title}</p>
                          <p className="portal-list__meta">
                            {p.spaceName} · {format(p.createdAt, "MMM d")}
                          </p>
                        </div>
                        <Link
                          href={`/${orgSlug}/c/${p.spaceSlug}`}
                          className="portal-list__action"
                        >
                          Open
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
        </SectionShell>
      </div>
    </div>
  );
}
