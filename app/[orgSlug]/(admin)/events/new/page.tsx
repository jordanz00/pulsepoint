import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { EventForm } from "@/components/events/event-form";
import { isEasyAdminMode } from "@/lib/admin-page-copy";

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const easy = isEasyAdminMode(orgSlug);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="New event"
        subtitle={
          easy
            ? "Name, date, then publish and copy the sign-up link."
            : "Create as draft or publish in one step — copy the registration link from Overview."
        }
        backHref={`/${orgSlug}/events`}
        backLabel="EventCore"
      />
      <EventForm orgSlug={orgSlug} />
    </AdminPage>
  );
}
