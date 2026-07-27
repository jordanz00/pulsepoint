"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { StaticDemoChrome } from "@/components/static-demo/static-demo-chrome";
import { readStaticDemoSession } from "@/lib/static-demo/session";

export function StaticDemoShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = readStaticDemoSession();
    if (!session) {
      router.replace("/demo/");
      return;
    }
    setAllowed(true);
    setReady(true);
  }, [router, pathname]);

  if (!ready || !allowed) {
    return (
      <div className="pp-canvas flex min-h-screen items-center justify-center">
        <p className="page-subtitle">Opening demo…</p>
      </div>
    );
  }

  return <StaticDemoChrome>{children}</StaticDemoChrome>;
}
