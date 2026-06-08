import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  WALKTHROUGH_STEPS,
  walkthroughModuleHref,
  walkthroughPageHref,
} from "@/lib/demo-walkthrough";

const DEMO_SLUG = "demo-healthcare";

export function DemoTourChecklist({ basePath = `/${DEMO_SLUG}` }: { basePath?: string }) {
  return (
    <div className="rounded-xl border border-[var(--pc-border)] bg-[var(--pc-bg-elevated)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-[var(--pc-text)]">Suggested tour (~35 min)</p>
        <Badge variant="warning">Demo</Badge>
      </div>
      <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
        Walk through the same areas a board or executive team would care about—members,
        events, and how we label Live vs Coming soon.
      </p>
      <p className="mt-2">
        <Link href={walkthroughPageHref(DEMO_SLUG, 0)} className="pc-link text-sm font-medium">
          Open guided walkthrough →
        </Link>
        {" · "}
        <Link href={`${basePath}/suite`} className="pc-link text-sm font-medium">
          Browse all modules →
        </Link>
      </p>
      <ol className="mt-4 space-y-2 text-sm">
        {WALKTHROUGH_STEPS.map((stop) => (
          <li key={stop.id} className="flex flex-wrap items-center gap-2">
            <span className="w-5 shrink-0 text-[var(--pc-text-tertiary)]">{stop.index + 1}.</span>
            <Link
              href={walkthroughModuleHref(DEMO_SLUG, stop.path, { guided: true })}
              className="pc-link font-medium"
            >
              {stop.title}
            </Link>
            <Badge
              variant={
                stop.status === "live"
                  ? "live"
                  : stop.status === "alpha"
                    ? "alpha"
                    : "roadmap"
              }
            >
              {stop.status === "live" ? "Live" : stop.status === "alpha" ? "Preview" : "Soon"}
            </Badge>
          </li>
        ))}
      </ol>
    </div>
  );
}
