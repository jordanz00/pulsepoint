import { redirect } from "next/navigation";
import { getDemoSession } from "@/lib/demo-mode";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

/**
 * After sign-in, send staff to their active org dashboard.
 * Standalone prototype: demo cookie → demo org; else → /demo.
 */
export default async function DashboardRedirectPage() {
  if (isStandalonePrototype()) {
    const demo = await getDemoSession();
    if (demo) {
      redirect(`/${demo.orgSlug}`);
    }
    redirect("/demo");
  }

  const { auth } = await import("@clerk/nextjs/server");
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  if (session.orgSlug) {
    redirect(`/${session.orgSlug}`);
  }
  redirect("/onboarding");
}
