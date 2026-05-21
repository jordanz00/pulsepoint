import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { EventForm } from "@/components/events/event-form";
import { CheckInButton } from "@/components/events/check-in-button";

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; eventId: string }>;
}) {
  const { orgSlug, eventId } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { id: eventId },
    include: {
      registrations: {
        orderBy: { createdAt: "desc" },
        include: { member: true },
      },
    },
  });
  if (!event) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        {event.status === "PUBLISHED" && (
          <Link
            href={`/${orgSlug}/e/${event.publicSlug}`}
            className="text-sm font-medium text-teal-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open public registration ↗
          </Link>
        )}
      </div>

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
        }}
      />

      <section>
        <h2 className="text-lg font-semibold">Attendees</h2>
        <ul className="mt-3 divide-y rounded-xl border bg-white">
          {event.registrations.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {r.member
                    ? `${r.member.firstName} ${r.member.lastName}`
                    : r.guestName ?? "Guest"}
                </p>
                <p className="text-zinc-500">
                  {r.guestEmail ?? r.member?.email ?? "—"} · {r.status}
                  {r.paidAt ? " · Paid" : ""}
                </p>
              </div>
              <CheckInButton
                registrationId={r.id}
                checkedIn={Boolean(r.checkedInAt)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
