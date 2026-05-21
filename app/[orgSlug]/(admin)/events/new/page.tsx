import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New event</h1>
        <p className="text-sm text-slate-500">PulsePoint Events</p>
      </div>
      <EventForm orgSlug={orgSlug} />
    </div>
  );
}
