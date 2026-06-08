"use client";

import { PlatformGlanceBriefing } from "@/components/platform/platform-glance-briefing";

/** Marketing homepage — same briefing as admin, demo org links. */
export function GlanceMarketingPreview() {
  return <PlatformGlanceBriefing orgSlug="demo-healthcare" />;
}
