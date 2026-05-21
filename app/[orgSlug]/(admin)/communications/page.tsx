import { redirect } from "next/navigation";

/** Legacy route — Marketing & Communications lives at /engage (PulsePoint Engage). */
export default async function CommunicationsRedirectPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/engage`);
}
