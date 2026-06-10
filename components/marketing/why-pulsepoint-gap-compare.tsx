import { FLAGSHIP_COMPARE_STORIES } from "@/lib/why-pulsepoint-flagship";

/** Static legacy vs PulsePoint contrast. */
export function WhyPulsePointGapCompare() {
  return (
    <div className="pp-flagship-gap" aria-label="Legacy AMS compared with PulsePoint">
      <div className="pp-flagship-gap-columns" aria-hidden>
        <span>Typical enterprise AMS</span>
        <span>PulsePoint</span>
      </div>

      <ul className="pp-flagship-gap-rows">
        {FLAGSHIP_COMPARE_STORIES.map((story) => (
          <li key={story.id} className="pp-flagship-gap-row">
            <p className="pp-flagship-gap-topic">{story.pulseHighlight}</p>
            <div className="pp-flagship-gap-pair">
              <p className="pp-flagship-gap-legacy">{story.legacy}</p>
              <p className="pp-flagship-gap-pulse">{story.pulse}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
