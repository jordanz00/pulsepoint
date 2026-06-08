import { redirect } from "next/navigation";
import { isStandalonePrototype } from "@/lib/standalone-prototype";
import { isEntraAuthProfile } from "@/lib/integration-profile";
import { isEntraConfigured } from "@/lib/entra-config";
import { EntraSignInButton } from "@/components/auth/entra-sign-in-button";

export default function SignInPage() {
  if (isStandalonePrototype()) {
    redirect("/demo");
  }

  if (isEntraAuthProfile() && isEntraConfigured()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--pc-bg)] p-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--pc-text-muted)]">
            PulsePoint
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--fg-default)]">Staff sign-in</h1>
          <p className="mt-2 max-w-sm text-sm text-[var(--pc-text-muted)]">
            Pilot uses Microsoft Entra ID — the same SSO path as enterprise deployment.
          </p>
        </div>
        <EntraSignInButton returnTo="/demo-healthcare" />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SignIn } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--pc-bg)] p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
