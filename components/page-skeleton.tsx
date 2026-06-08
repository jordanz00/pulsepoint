export function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="Loading page">
      <div className="page-header">
        <div className="skeleton skeleton-title" style={{ width: "220px" }} />
        <div className="skeleton" style={{ width: "96px", height: "34px" }} />
      </div>
      <div className="stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton stat-card-skeleton" style={{ height: "88px" }} />
        ))}
      </div>
      <div className="card glass" style={{ marginTop: "16px" }}>
        <div className="card-body">
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="skeleton skeleton-text"
              style={{ width: row === 0 ? "100%" : `${90 - row * 8}%`, marginBottom: "10px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td colSpan={6}>
            <div className="skeleton skeleton-text" style={{ width: "100%" }} />
          </td>
        </tr>
      ))}
    </>
  );
}
