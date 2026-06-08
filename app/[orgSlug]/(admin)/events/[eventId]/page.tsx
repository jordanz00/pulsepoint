import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { EventForm } from "@/components/events/event-form";
import { EventConferencePanel } from "@/components/events/event-conference-panel";
import { EventTicketPanel } from "@/components/events/event-ticket-panel";
import { EventCorrespondencePanel } from "@/components/events/event-correspondence-panel";
import { EventMarketingKit } from "@/components/events/event-marketing-kit";
import { EventAttendeesPanel } from "@/components/events/event-attendees-panel";
import type { EventAttendeeRow } from "@/components/events/event-attendees-panel";
import { EventCoreDetailShell } from "@/components/events/eventcore-detail-shell";
import { EventDetailSummary } from "@/components/events/event-detail-summary";
import { EventOverviewPanel } from "@/components/events/event-overview-panel";
import { EventAnalyticsPanel } from "@/components/events/event-analytics-panel";
import { EventPlannerPanel } from "@/components/events/event-planner-panel";
import { EventPromoPanel } from "@/components/events/event-promo-panel";
import { EventSurveyPanel } from "@/components/events/event-survey-panel";
import { EventSessionRsvpPanel } from "@/components/events/event-session-rsvp-panel";
import { EventScheduledEmailPanel } from "@/components/events/event-scheduled-email-panel";
import { EventAssetsPanel } from "@/components/events/event-assets-panel";
import { EventEasyDnnPanel } from "@/components/events/event-easydnn-panel";
import { EventBadgesPanel } from "@/components/events/event-badges-panel";
import { loadEventSurveyForAdmin } from "@/app/actions/event-advanced";
import type { MicrositeConfig } from "@/components/events/event-public-microsite";
import { loadEventSegmentCounts } from "@/lib/load-event-segment-counts";
import { buildEventMarketingPack } from "@/lib/event-marketing-copy";
import { loadEventAnalytics } from "@/lib/event-analytics";
import { parsePlannerConfig } from "@/lib/event-planner-config";
import { isEasyAdminMode, eventStatusLabel } from "@/lib/admin-page-copy";
import { getEasyDnnSiteConfig } from "@/lib/adapters/cms";
import { CheckInButton } from "@/components/events/check-in-button";
import { EventAttendeeEmailButton } from "@/components/events/event-attendee-email-button";
import { EventPublishPanel } from "@/components/events/event-publish-panel";
import { CopyRegistrationLink } from "@/components/events/copy-registration-link";
import { getEventPublishReadiness } from "@/lib/events/publish-readiness";
import {
  buildEventRegistrationUrl,
  eventRegistrationPath,
} from "@/lib/events/registration-url";
import type { EventCoreTab } from "@/components/events/eventcore-detail-shell";

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatWhen(d: Date): string {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}


function attendeeRows(
  registrations: Array<{
    id: string;
    guestEmail: string | null;
    guestName: string | null;
    status: string;
    paidAt: Date | null;
    checkedInAt: Date | null;
    waitlistPosition: number | null;
    staffNotes: string;
    badgeCode: string | null;
    refundStatus: string;
    member: {
      firstName: string;
      lastName: string;
      email: string | null;
    } | null;
  }>,
): EventAttendeeRow[] {
  return registrations
    .map((r) => {
      const email = (r.guestEmail ?? r.member?.email)?.trim();
      if (!email) return null;
      const displayName = r.member
        ? `${r.member.firstName} ${r.member.lastName}`.trim()
        : (r.guestName ?? "Guest");
      return {
        id: r.id,
        displayName,
        email,
        status: r.status,
        paid: Boolean(r.paidAt),
        checkedIn: Boolean(r.checkedInAt),
        waitlistPosition: r.waitlistPosition,
        staffNotes: r.staffNotes,
        badgeCode: r.badgeCode,
        refundStatus: r.refundStatus,
      };
    })
    .filter((x): x is EventAttendeeRow => x !== null);
}

const SEND_LIMIT = Number(process.env.ENGAGE_SEND_LIMIT ?? "50");

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; eventId: string }>;
  searchParams: Promise<{ published?: string; tab?: string }>;
}) {
  const { orgSlug, eventId } = await params;
  const query = await searchParams;
  const easy = isEasyAdminMode(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { id: eventId },
    include: {
      registrations: {
        orderBy: { createdAt: "desc" },
        include: { member: true },
        take: easy ? 50 : 500,
      },
    },
  });
  if (!event) notFound();

  const regUrl = buildEventRegistrationUrl(orgSlug, event.publicSlug);
  const regPath = eventRegistrationPath(orgSlug, event.publicSlug);
  const publishReadiness = getEventPublishReadiness({
    title: event.title,
    startsAt: event.startsAt,
    publicSlug: event.publicSlug,
  });
  const initialTab = (query.tab === "settings" ? "settings" : "overview") as EventCoreTab;
  const microsite = (event.micrositeConfig as MicrositeConfig | null) ?? null;

  if (easy) {
    const checkedIn = event.registrations.filter((r) => r.checkedInAt).length;
    const rows = attendeeRows(event.registrations);
    return (
      <AdminPage orgSlug={orgSlug}>
        <PageHeader
          title={event.title}
          subtitle={`${eventStatusLabel(event.status)} · ${formatWhen(event.startsAt)}`}
          backHref={`/${orgSlug}/events`}
          backLabel="EventCore"
          actions={
            event.status === "PUBLISHED" ? (
              <>
                <CopyRegistrationLink registrationUrl={regUrl} label="Copy sign-up link" />
                <Link href={regPath} className="pc-btn-secondary" target="_blank" rel="noopener noreferrer">
                  Sign-up page ↗
                </Link>
              </>
            ) : undefined
          }
        />
        {query.published === "1" ? (
          <p className="ec-publish-banner" role="status">
            Event published. Copy the registration link and share with members.
          </p>
        ) : null}
        {event.status === "DRAFT" ? (
          <EventPublishPanel
            orgSlug={orgSlug}
            eventId={event.id}
            status={event.status}
            registrationUrl={regUrl}
            registrationPath={regPath}
            readiness={publishReadiness}
          />
        ) : null}
        <p className="text-base text-[var(--pc-text-secondary)]">
          {event.registrations.length} registered · {checkedIn} checked in
        </p>
        {rows.length === 0 ? (
          <p className="mt-4 text-[var(--pc-text-secondary)]">No one registered yet.</p>
        ) : (
          <ul className="pc-simple-list mt-4">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium">{r.displayName}</p>
                  <p className="mt-0.5 text-sm text-[var(--pc-text-secondary)]">{r.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <EventAttendeeEmailButton
                    orgSlug={orgSlug}
                    eventId={event.id}
                    registrationId={r.id}
                    email={r.email}
                    displayName={r.displayName}
                  />
                  <CheckInButton orgSlug={orgSlug} registrationId={r.id} checkedIn={r.checkedIn} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPage>
    );
  }

  const [
    speakers,
    sponsors,
    sessions,
    tickets,
    segmentCounts,
    promos,
    analytics,
    assets,
    scheduledEmails,
    sessionRegs,
    surveyLoad,
    easyDnnSite,
  ] = await Promise.all([
    db.eventSpeaker.findMany({ where: { eventId }, orderBy: { sortOrder: "asc" } }),
    db.eventSponsor.findMany({ where: { eventId }, orderBy: { sortOrder: "asc" } }),
    db.eventSession.findMany({ where: { eventId }, orderBy: { startsAt: "asc" } }),
    db.eventTicketType.findMany({ where: { eventId }, orderBy: { sortOrder: "asc" } }),
    loadEventSegmentCounts(org.id, eventId),
    db.eventPromoCode.findMany({ where: { eventId }, orderBy: { createdAt: "desc" } }),
    loadEventAnalytics(org.id, eventId, {
      capacity: event.capacity,
      priceCents: event.priceCents,
    }),
    db.eventAsset.findMany({ where: { eventId }, orderBy: { sortOrder: "asc" } }),
    db.eventScheduledEmail.findMany({
      where: { eventId },
      orderBy: { sendAt: "asc" },
      take: 50,
    }),
    db.eventSessionRegistration.findMany({ where: { eventId } }),
    loadEventSurveyForAdmin(orgSlug, eventId),
    getEasyDnnSiteConfig(org.id),
  ]);

  const marketingPack = buildEventMarketingPack(event, org.name);
  const rows = attendeeRows(event.registrations);
  const planner = parsePlannerConfig(event.plannerConfig);
  const waitlistCount = analytics.waitlist;
  const enrollmentMap: Record<string, string[]> = {};
  for (const e of sessionRegs) {
    if (!enrollmentMap[e.sessionId]) enrollmentMap[e.sessionId] = [];
    enrollmentMap[e.sessionId].push(e.registrationId);
  }
  const regLabels = rows.map((r) => ({ id: r.id, label: r.displayName }));
  const badgeReady = event.registrations.filter((r) => r.badgeCode).length;
  const confirmedCount = analytics.confirmed;
  const websiteExport = (event.websiteExportConfig as { lastExportedAt?: string } | null) ?? null;
  const surveyData =
    surveyLoad.ok && surveyLoad.survey
      ? {
          title: surveyLoad.survey.title,
          active: surveyLoad.survey.active,
          responseCount: surveyLoad.survey.responseCount,
          opensAt: surveyLoad.survey.opensAt,
          closesAt: surveyLoad.survey.closesAt,
        }
      : null;

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={event.title}
        subtitle={`${eventStatusLabel(event.status)} · ${formatWhen(event.startsAt)}`}
        backHref={`/${orgSlug}/events`}
        backLabel="EventCore"
        actions={
          event.status === "PUBLISHED" ? (
            <>
              <CopyRegistrationLink registrationUrl={regUrl} />
              <Link href={regPath} className="pc-btn-secondary" target="_blank" rel="noopener noreferrer">
                Open registration ↗
              </Link>
            </>
          ) : undefined
        }
      />

      <EventCoreDetailShell
        initialTab={initialTab}
        summary={
          <EventDetailSummary
            analytics={analytics}
            statusLabel={eventStatusLabel(event.status)}
            format={event.format}
            venueName={event.venueName}
          />
        }
        panels={{
          overview: (
            <EventOverviewPanel
              orgSlug={orgSlug}
              eventId={event.id}
              eventTitle={event.title}
              statusLabel={eventStatusLabel(event.status)}
              format={event.format}
              venueName={event.venueName}
              registrationUrl={regUrl}
              registrationPath={regPath}
              status={event.status}
              publishReadiness={publishReadiness}
              showPublishedBanner={query.published === "1"}
              analytics={analytics}
            />
          ),
          attendees: <EventAttendeesPanel orgSlug={orgSlug} eventId={event.id} rows={rows} />,
          program: (
            <EventConferencePanel
              orgSlug={orgSlug}
              eventId={event.id}
              micrositeConfig={microsite}
              speakers={speakers.map((s) => ({
                id: s.id,
                name: s.name,
                title: s.title,
                role: s.role,
              }))}
              sponsors={sponsors.map((s) => ({
                id: s.id,
                name: s.name,
                tier: s.tier,
                amountCents: s.amountCents,
              }))}
              sessions={sessions.map((s) => ({
                id: s.id,
                title: s.title,
                startsAt: s.startsAt,
                room: s.room,
                track: s.track,
              }))}
            />
          ),
          tickets: (
            <>
              <EventTicketPanel
                orgSlug={orgSlug}
                eventId={event.id}
                tickets={tickets.map((t) => ({
                  id: t.id,
                  name: t.name,
                  description: t.description,
                  priceCents: t.priceCents,
                  capacity: t.capacity,
                  active: t.active,
                }))}
              />
              <EventPromoPanel
                orgSlug={orgSlug}
                eventId={event.id}
                promos={promos.map((p) => ({
                  id: p.id,
                  code: p.code,
                  label: p.label,
                  discountPercent: p.discountPercent,
                  discountCents: p.discountCents,
                  maxUses: p.maxUses,
                  usedCount: p.usedCount,
                  active: p.active,
                }))}
              />
            </>
          ),
          marketing: (
            <EventMarketingKit
              pack={marketingPack}
              registrationUrl={regUrl}
              heroImageUrl={microsite?.heroImage ?? null}
            />
          ),
          sponsors: (
            <EventAssetsPanel
              orgSlug={orgSlug}
              eventId={event.id}
              assets={assets.map((a) => ({
                id: a.id,
                kind: a.kind,
                label: a.label,
                url: a.url,
                altText: a.altText,
              }))}
            />
          ),
          sessions: (
            <EventSessionRsvpPanel
              orgSlug={orgSlug}
              eventId={event.id}
              sessions={sessions.map((s) => ({
                sessionId: s.id,
                title: s.title,
                when: s.startsAt.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }),
                room: s.room,
                enrolled: enrollmentMap[s.id]?.length ?? 0,
                capacityLabel: "",
              }))}
              registrations={regLabels}
              enrollments={enrollmentMap}
            />
          ),
          email: (
            <EventCorrespondencePanel
              orgSlug={orgSlug}
              eventId={event.id}
              segmentCounts={segmentCounts}
              sendLimit={SEND_LIMIT}
            />
          ),
          schedule: (
            <EventScheduledEmailPanel
              orgSlug={orgSlug}
              eventId={event.id}
              rows={scheduledEmails.map((e) => ({
                id: e.id,
                name: e.name,
                segment: e.segment,
                subject: e.subject,
                sendAt: e.sendAt.toISOString(),
                status: e.status,
              }))}
            />
          ),
          surveys: (
            <EventSurveyPanel orgSlug={orgSlug} eventId={event.id} survey={surveyData} />
          ),
          badges: (
            <EventBadgesPanel
              orgSlug={orgSlug}
              eventId={event.id}
              badgeReadyCount={badgeReady}
              totalConfirmed={confirmedCount}
            />
          ),
          website: (
            <EventEasyDnnPanel
              orgSlug={orgSlug}
              eventId={event.id}
              lastExportedAt={websiteExport?.lastExportedAt ?? null}
              siteUrl={easyDnnSite?.siteUrl ?? null}
              eventsPagePath={easyDnnSite?.eventsPagePath ?? null}
            />
          ),
          analytics: <EventAnalyticsPanel analytics={analytics} />,
          planner: (
            <EventPlannerPanel
              orgSlug={orgSlug}
              eventId={event.id}
              status={event.status}
              venueName={event.venueName}
              venueAddress={event.venueAddress}
              timezone={event.timezone}
              format={event.format}
              registrationOpensAt={
                event.registrationOpensAt ? toLocalInput(event.registrationOpensAt) : ""
              }
              registrationClosesAt={
                event.registrationClosesAt ? toLocalInput(event.registrationClosesAt) : ""
              }
              waitlistEnabled={event.waitlistEnabled}
              waitlistCount={waitlistCount}
              planner={planner}
            />
          ),
          settings: (
            <>
              <EventForm
                orgSlug={orgSlug}
                eventId={event.id}
                initial={{
                  title: event.title,
                  description: event.description,
                  startsAt: toLocalInput(event.startsAt),
                  endsAt: event.endsAt ? toLocalInput(event.endsAt) : undefined,
                  capacity: event.capacity ?? undefined,
                  priceCents: event.priceCents,
                  status: event.status,
                  publicSlug: event.publicSlug,
                  venueName: event.venueName,
                  format: event.format,
                }}
              />
            </>
          ),
        }}
      />
    </AdminPage>
  );
}
