import { buildAdminNav } from "@/lib/nav-config";
import { STATIC_DEMO_ORG } from "@/lib/static-demo/seed";
import { StaticDemoCatchAllClient } from "./client";

/** Pre-render every admin nav path for static export. */
export function generateStaticParams() {
  const base = `/${STATIC_DEMO_ORG.slug}`;
  const fromNav = buildAdminNav(STATIC_DEMO_ORG.slug)
    .map((item) => item.href.replace(base, "").replace(/^\//, ""))
    .filter(Boolean)
    .map((path) => path.split("/").filter(Boolean));

  const extras = [["portal"], ["exceptions"], ["settings"], ["flagship"]];

  const seen = new Set<string>();
  const params: { slug: string[] }[] = [];
  for (const slug of [...fromNav, ...extras]) {
    if (slug.length === 0) continue;
    if (["suite", "members", "events", "insights", "walkthrough"].includes(slug[0]!)) {
      continue;
    }
    const key = slug.join("/");
    if (seen.has(key)) continue;
    seen.add(key);
    params.push({ slug });
  }
  return params;
}

export default function StaticDemoCatchAllPage() {
  return <StaticDemoCatchAllClient />;
}
