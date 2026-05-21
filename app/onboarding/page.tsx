import { redirect } from "next/navigation";
import { ORIGIN_STORY, TAGLINE } from "@/lib/brand";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

export default function OnboardingPage() {
  if (isStandalonePrototype()) {
    redirect("/demo");
  }

  const { OrganizationList } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--pc-bg)] p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Welcome to PulsePoint</h1>
        <p className="mt-2 text-sm font-medium text-teal-800">{TAGLINE}</p>
        <p className="mt-1 text-sm text-zinc-500">{ORIGIN_STORY}</p>
        <p className="mt-2 text-zinc-600">
          Create an organization for your association, or select an existing one.
        </p>
      </div>
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/dashboard"
        afterSelectOrganizationUrl="/dashboard"
      />
    </div>
  );
}
