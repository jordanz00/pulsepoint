import { DASHBOARD_TOPIC_LEGEND } from "@/lib/dashboard-topic-colors";

type Props = {
  className?: string;
};

/** Compact color legend for CEO dashboard overview */
export function DashboardTopicLegend({ className = "" }: Props) {
  return (
    <div
      className={`pp-dashboard-legend glass pp-glass-surface${className ? ` ${className}` : ""}`}
      role="list"
      aria-label="Dashboard color legend"
    >
      <span className="pp-dashboard-legend-title">Color key</span>
      <ul className="pp-dashboard-legend-items">
        {DASHBOARD_TOPIC_LEGEND.map(({ topic, label }) => (
          <li key={topic} className="pp-dashboard-legend-item" role="listitem">
            <span
              className={`pp-topic-swatch pp-topic-swatch--${topic} pp-dashboard-legend-swatch`}
              aria-hidden
            />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
