import { ConfirmProvider } from "@/components/confirm-dialog";
import { ToastProvider } from "@/components/toast";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

/**
 * Wraps the app in Clerk only when not running the standalone demo prototype.
 * When DEMO_MODE=true, children render without Clerk (no keyless / sign-in UI).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const inner = (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );

  if (isStandalonePrototype()) {
    return inner;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ClerkProvider } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  return <ClerkProvider>{inner}</ClerkProvider>;
}
