import { LeadershipLoopPanel } from "@/components/executive/leadership-loop-panel";
import type { LeadershipLoopContext } from "@/lib/leadership-loop";
import { FlagshipHubShell } from "./flagship-hub-shell";
import type { FlagshipFeatureStat } from "@/lib/flagship-features";

export function FlagshipExecutiveHub({
  orgSlug,
  stat,
  loopContext,
}: {
  orgSlug: string;
  stat: FlagshipFeatureStat;
  loopContext: LeadershipLoopContext;
}) {
  return (
    <FlagshipHubShell featureId="executive-command" orgSlug={orgSlug} stat={stat}>
      <LeadershipLoopPanel orgSlug={orgSlug} context={loopContext} variant="compact" />
    </FlagshipHubShell>
  );
}
