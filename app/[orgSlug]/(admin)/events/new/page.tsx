import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New event</h1>
      <EventForm orgSlug={orgSlug} />
    </div>
  );
}
