import Link from "next/link";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-12 prose prose-zinc">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        Pre-production notice: counsel must approve final policy text before
        go-live. This page lists actual subprocessors and data practices for IT
        questionnaires.
      </p>

      <h2>What we process</h2>
      <p>
        PulsePoint processes <strong>member contact information (PII)</strong> for
        association operations—names, emails, tags, staff notes, and event
        registrations. This product is <strong>not</strong> intended for PHI.
      </p>

      <h2>Subprocessors</h2>
      <p>
        We use the following providers to operate the service. A full IT table
        (DPA, residency, data categories) is in{" "}
        <code>docs/SUBPROCESSORS.md</code> in the repository.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Vendor</th>
            <th className="text-left">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Clerk</td>
            <td>Authentication and organization membership</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Event registration payments (when enabled)</td>
          </tr>
          <tr>
            <td>Neon / Postgres host</td>
            <td>Primary database</td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>Transactional email (e.g. registration confirmation)</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Application hosting</td>
          </tr>
          <tr>
            <td>Sentry</td>
            <td>Error monitoring (PII scrubbing enabled in configuration)</td>
          </tr>
        </tbody>
      </table>

      <h2>Your data rights</h2>
      <ul>
        <li>
          <strong>Export:</strong> Organization admins may export member CSV
          (audited; ADMIN role required).
        </li>
        <li>
          <strong>Deletion:</strong> Admins may delete members without event
          registrations; notes are removed with the member.
        </li>
        <li>
          <strong>Formal DSAR / automated portability:</strong> on the product
          roadmap—contact your association administrator today.
        </li>
      </ul>

      <h2>Security</h2>
      <p>
        Tenant isolation is enforced in application code (<code>getOrgDb</code>).
        Payment webhooks are signature-verified and idempotent. Failed
        non-critical automations are queued for staff review rather than failing
        silently.
      </p>

      <p className="text-sm text-zinc-500">
        Last updated: May 2026 ·{" "}
        <Link href="/" className="text-teal-700 underline">
          Home
        </Link>
      </p>
    </article>
  );
}
