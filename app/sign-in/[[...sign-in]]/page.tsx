import { redirect } from "next/navigation";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

export default function SignInPage() {
  if (isStandalonePrototype()) {
    redirect("/demo");
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
