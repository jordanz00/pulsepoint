import { DemoLauncher } from "@/components/static-demo/demo-launcher";
import { isGitHubPagesBuild } from "@/lib/github-pages";

/**
 * Demo launcher.
 * - GitHub Pages: fully static client enter (sessionStorage).
 * - Localhost: same UI; POST forms hit /api/demo/enter when not on Pages.
 */
export default function DemoPage() {
  // Keep this page free of Prisma/cookies so it static-exports for Pages.
  void isGitHubPagesBuild;
  return <DemoLauncher />;
}
