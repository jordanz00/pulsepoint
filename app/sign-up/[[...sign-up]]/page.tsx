import { redirect } from "next/navigation";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

export default function SignUpPage() {
  if (isStandalonePrototype()) {
    redirect("/demo");
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SignUp } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--pc-bg)] p-6">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
