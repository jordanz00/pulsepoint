/**
 * Board pack — leadership loop follow-up section (printable HTML).
 */

import { LEADERSHIP_LOOP_STEPS, leadershipLoopTotalMinutes } from "@/lib/leadership-loop";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderBoardPackLeadershipLoopSection(orgSlug: string): string {
  const totalMin = leadershipLoopTotalMinutes();
  const steps = LEADERSHIP_LOOP_STEPS.map(
    (s) =>
      `<li><strong>${escapeHtml(s.title)}</strong> (${s.durationMin} min) — ${escapeHtml(s.pitch)} <span class="muted">/${escapeHtml(orgSlug)}${escapeHtml(s.path)}</span></li>`,
  ).join("");

  return `
    <section>
      <h2>Leadership loop — recommended follow-up (${totalMin} min)</h2>
      <p class="muted">Use this scripted path after the board reviews KPIs — live stats on each stop in the admin app.</p>
      <ol>${steps}</ol>
      <p class="muted">Start: /${escapeHtml(orgSlug)}/leadership</p>
    </section>`;
}
