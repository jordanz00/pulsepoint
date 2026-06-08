/**
 * EasyDNN HTML module builder — static HTML safe for DNN HTML Pro modules.
 */

import type {
  EasyDnnExportBundle,
  EasyDnnExportInput,
  MemberDirectoryExportInput,
} from "@/lib/adapters/cms/types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BASE_INSTRUCTIONS = [
  "In EasyDNN, add an HTML module to your target DNN page.",
  "Paste moduleHtml into the HTML editor (Source view).",
  "Upload remote images to DNN File Manager and replace URLs if needed.",
  "Publish the DNN page; test all links open correctly.",
];

export function buildEasyDnnEventModule(input: EasyDnnExportInput): EasyDnnExportBundle {
  const { event, registrationUrl, accent, orgName } = input;
  const dateStr = event.startsAt.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const speakerHtml = input.speakers.length
    ? `<section class="ec-dnn-speakers"><h3>Speakers</h3><ul>${input.speakers
        .map(
          (s) =>
            `<li><strong>${esc(s.name)}</strong> — ${esc(s.title || s.role)}</li>`,
        )
        .join("")}</ul></section>`
    : "";

  const sponsorHtml = input.sponsors.length
    ? `<section class="ec-dnn-sponsors"><h3>Sponsors</h3><div class="ec-dnn-sponsor-grid">${input.sponsors
        .map((s) => {
          const logo = s.logoUrl
            ? `<img src="${esc(s.logoUrl)}" alt="${esc(s.name)}" loading="lazy" />`
            : `<span class="ec-dnn-sponsor-name">${esc(s.name)}</span>`;
          return `<div class="ec-dnn-sponsor">${logo}<span>${esc(s.tier)}${s.boothNumber ? ` · Booth ${esc(s.boothNumber)}` : ""}</span></div>`;
        })
        .join("")}</div></section>`
    : "";

  const sessionHtml = input.sessions.length
    ? `<section class="ec-dnn-agenda"><h3>Agenda</h3><ul>${input.sessions
        .map((s) => {
          const t = s.startsAt.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
          return `<li><time>${esc(t)}</time> — <strong>${esc(s.title)}</strong>${s.room ? ` (${esc(s.room)})` : ""}</li>`;
        })
        .join("")}</ul></section>`
    : "";

  const heroStyle = input.heroImage
    ? `background-image:linear-gradient(180deg,rgba(15,23,42,.6),rgba(15,23,42,.85)),url('${esc(input.heroImage)}');background-size:cover;background-position:center;`
    : `background:linear-gradient(135deg,${accent},#0f172a);`;

  const moduleHtml = `<!-- PulsePoint → EasyDNN HTML module v1.1 -->
<div class="ec-dnn-event" style="--ec-accent:${accent};font-family:system-ui,sans-serif;color:#0f172a;max-width:960px;margin:0 auto;">
<style>
.ec-dnn-event .ec-dnn-hero{padding:2.5rem 1.5rem;color:#fff;border-radius:12px;${heroStyle}}
.ec-dnn-event .ec-dnn-hero h1{margin:0 0 .5rem;font-size:1.75rem;}
.ec-dnn-event .ec-dnn-cta{display:inline-block;margin-top:1rem;padding:.65rem 1.25rem;background:#fff;color:${accent};font-weight:700;text-decoration:none;border-radius:8px;}
.ec-dnn-event section{margin:1.5rem 0;padding:1rem;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;}
.ec-dnn-event h3{margin:0 0 .75rem;font-size:1rem;color:${accent};}
.ec-dnn-sponsor-grid{display:flex;flex-wrap:wrap;gap:1rem;}
.ec-dnn-sponsor img{max-height:48px;max-width:120px;object-fit:contain;}
</style>
${input.logoUrl ? `<img src="${esc(input.logoUrl)}" alt="${esc(orgName)}" style="max-height:48px;margin-bottom:1rem;" />` : ""}
<div class="ec-dnn-hero">
  <p style="margin:0;opacity:.9;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;">${esc(orgName)}</p>
  <h1>${esc(event.title)}</h1>
  <p style="margin:0;opacity:.95;">${esc(dateStr)}</p>
  ${event.venueName ? `<p style="margin:.5rem 0 0;">${esc(event.venueName)} · ${esc(event.format.replace("_", " "))}</p>` : ""}
  <a class="ec-dnn-cta" href="${esc(registrationUrl)}">Register now</a>
</div>
${event.description ? `<section><p>${esc(event.description)}</p></section>` : ""}
${speakerHtml}
${sessionHtml}
${sponsorHtml}
<p style="font-size:.75rem;color:#64748b;margin-top:2rem;">Powered by PulsePoint · EasyDNN module</p>
</div>`;

  const assets: { label: string; url: string }[] = [];
  if (input.logoUrl) assets.push({ label: "Organization logo", url: input.logoUrl });
  if (input.heroImage) assets.push({ label: "Hero image", url: input.heroImage });
  for (const s of input.sponsors) {
    if (s.logoUrl) assets.push({ label: `Sponsor: ${s.name}`, url: s.logoUrl });
  }

  const dnnSiteUrl = input.siteConfig?.siteUrl?.replace(/\/$/, "");

  return {
    version: "1.1",
    generatedAt: new Date().toISOString(),
    moduleHtml,
    manifest: {
      title: event.title,
      registrationUrl,
      dnnSiteUrl,
      assets,
      instructions: [
        ...BASE_INSTRUCTIONS,
        dnnSiteUrl
          ? `Target EasyDNN site: ${dnnSiteUrl}${input.siteConfig?.eventsPagePath ?? ""}`
          : "Configure EasyDNN site URL in PulsePoint Integrations for deep links.",
        "Registration CTA points to PulsePoint public event page (recommended for paid registration).",
      ],
    },
  };
}

export function buildEasyDnnMemberDirectoryModule(
  input: MemberDirectoryExportInput,
): EasyDnnExportBundle {
  const rows = input.members
    .map(
      (m) =>
        `<tr><td>${esc(m.name)}</td><td>${esc(m.title)}</td><td>${esc(m.organization)}</td></tr>`,
    )
    .join("");

  const moduleHtml = `<!-- PulsePoint MemberCore → EasyDNN directory module -->
<div class="pp-dnn-directory" style="font-family:system-ui,sans-serif;max-width:960px;margin:0 auto;">
<style>
.pp-dnn-directory table{width:100%;border-collapse:collapse;font-size:.9rem;}
.pp-dnn-directory th,.pp-dnn-directory td{padding:.5rem .75rem;border-bottom:1px solid #e2e8f0;text-align:left;}
.pp-dnn-directory th{background:#f1f5f9;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;}
</style>
<h2 style="font-size:1.25rem;margin:0 0 1rem;">${esc(input.orgName)} — Member directory</h2>
<table>
<thead><tr><th>Name</th><th>Title</th><th>Organization</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p style="font-size:.75rem;color:#64748b;margin-top:1rem;">Updated via PulsePoint MemberCore</p>
</div>`;

  return {
    version: "1.1",
    generatedAt: new Date().toISOString(),
    moduleHtml,
    manifest: {
      title: `${input.orgName} member directory`,
      registrationUrl: input.siteConfig?.siteUrl ?? "",
      dnnSiteUrl: input.siteConfig?.siteUrl,
      assets: [],
      instructions: [
        ...BASE_INSTRUCTIONS,
        "Paste on your EasyDNN member directory or leadership page.",
        "Re-export when member roster changes in PulsePoint.",
      ],
    },
  };
}
