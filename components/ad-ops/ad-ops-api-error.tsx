export function AdOpsApiError({ detail }: { detail?: string }) {
  return (
    <div className="card" role="alert">
      <h2>Ad-ops API unavailable</h2>
      <p className="muted">
        Start the full stack: <code>pnpm dev</code> (runs Next.js + API + worker). Ad-ops Postgres and
        Redis must be up: <code>docker compose up -d</code>, then <code>pnpm ad-ops:setup</code>.
      </p>
      {detail ? (
        <p className="muted">
          <small>{detail}</small>
        </p>
      ) : null}
    </div>
  );
}
