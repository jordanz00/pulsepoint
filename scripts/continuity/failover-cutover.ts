/**
 * Failover cutover assistant — prints steps and runs preflight on standby URL.
 *
 * Usage:
 *   STANDBY_URL=http://localhost:3000 pnpm continuity:cutover
 */

import "dotenv/config";
import { fetchHealth } from "./_shared";

async function main(): Promise<void> {
  const primary = process.env.PRIMARY_URL ?? "(your Vercel URL)";
  const standby = process.env.STANDBY_URL ?? "http://localhost:3000";

  console.log(`
== PulsePoint failover cutover ($0 path) ==

1. Confirm primary is down:
   PRIMARY_URL=${primary}
   pnpm continuity:health

2. Start standby (if not running):
   pnpm continuity:standby

3. Preflight standby:
   ./scripts/failover-preflight.sh ${standby}

4. Tell staff the backup URL:
   ${standby}/demo  → Enter demo → ${standby}/demo-healthcare

5. Update Stripe + Clerk webhooks to ${standby} (when on standby host)

6. Optional: Cloudflare Tunnel (free) to expose laptop standby:
   cloudflared tunnel --url http://localhost:3000
   See docs/FREE-CONTINUITY-TOOLKIT.md

7. When primary returns: flip DNS back or retire tunnel.
`);

  const h = await fetchHealth(standby);
  if (!h.ok) {
    console.error(`STANDBY NOT READY: ${standby} (${h.status}) ${h.body}`);
    process.exit(1);
  }
  console.log(`Standby health OK: ${standby}/api/health`);
}

main();
