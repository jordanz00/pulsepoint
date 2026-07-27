/** Client-side demo session for GitHub Pages (no cookies / API). */

export const STATIC_DEMO_SESSION_KEY = "pp_demo_session";

export type StaticDemoMode = "walkthrough" | "suite" | "overview";

export type StaticDemoSession = {
  v: 1;
  enteredAt: string;
  mode: StaticDemoMode;
};

export function readStaticDemoSession(): StaticDemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STATIC_DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaticDemoSession;
    if (parsed?.v !== 1 || !parsed.mode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function enterStaticDemo(mode: StaticDemoMode = "overview"): void {
  const session: StaticDemoSession = {
    v: 1,
    enteredAt: new Date().toISOString(),
    mode,
  };
  sessionStorage.setItem(STATIC_DEMO_SESSION_KEY, JSON.stringify(session));
}

export function exitStaticDemo(): void {
  sessionStorage.removeItem(STATIC_DEMO_SESSION_KEY);
}

export function staticDemoLandingPath(mode: StaticDemoMode): string {
  if (mode === "walkthrough") return "/demo-healthcare/walkthrough/?step=0";
  if (mode === "suite") return "/demo-healthcare/suite/";
  return "/demo-healthcare/";
}
