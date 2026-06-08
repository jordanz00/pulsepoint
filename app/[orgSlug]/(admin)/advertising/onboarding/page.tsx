import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { adOpsApi } from "@/lib/ad-ops-api";

export default async function AdvertisingOnboardingPage() {
  try {
    const checklist = await adOpsApi<{
      title: string;
      steps: Array<{ id: number; label: string; state: string }>;
    }>("/onboarding/checklist");

    return (
      <>
        <h1>{checklist.title}</h1>
        <p className="muted">AMS ↔ PulsePoint order of operations for new hires.</p>
        <div className="card">
          <ol style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
            {checklist.steps.map((s) => (
              <li key={s.id}>
                <strong>{s.label}</strong>
                <span className="muted"> — {s.state}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card">
          <h2>Workflow diagram</h2>
          <pre style={{ fontSize: "0.8rem", overflow: "auto" }}>
            {`Brief → AMS Intake → Validation → Audience QA → Budget QA → Creative/MLR QA
  → Ready to Traffic → Sync Queue → PulsePoint → Live → Reporting → Alerts`}
          </pre>
        </div>
      </>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return (
      <>
        <h1>Onboarding</h1>
        <AdOpsApiError detail={msg} />
      </>
    );
  }
}
