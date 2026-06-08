import { redirect } from "next/navigation";

/** Work module marketing page — route staff to the org home dashboard. */
export default async function WorkProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}`);
}
