import { OrganizationList } from "@clerk/nextjs";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Welcome to PulseCore</h1>
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
