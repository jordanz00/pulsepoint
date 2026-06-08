"use client";

import { isStandalonePrototype } from "@/lib/standalone-prototype";

export function PortalClerkBar() {
  if (isStandalonePrototype()) {
    return (
      <span className="text-xs font-medium text-[var(--pc-text-tertiary)]">Demo session</span>
    );
  }

  /* eslint-disable @typescript-eslint/no-require-imports */
  const { UserButton } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  /* eslint-enable @typescript-eslint/no-require-imports */

  return <UserButton />;
}
