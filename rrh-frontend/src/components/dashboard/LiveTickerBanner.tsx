import { ZONES, ALERTS } from "../../constants";
import { LEVEL_COLORS } from "../../constants";
import type { Zone } from "../../types";

const ALERT_PREFIX: Record<string, string> = {
  crit: "⚠️",
  high: "⚠️",
  mod:  "ℹ️",
  low:  "✓",
};

export default function LiveTickerBanner() {
  const tickerItems = [
    "🔴 LIVE",
    ...ZONES.map(
      (z: Zone) =>
        `${z.score}% Risk · ${z.name} · ${z.rainfall}/day · River ${z.river}`
    ),
    ...ALERTS.slice(0, 2).map((a) => `${ALERT_PREFIX[a.lvl] ?? "⚠️"} ${a.title} · ${a.zone}`),
    "↻ Updates every 5 min",
  ];

  const tickerText = tickerItems.join("   •   ");

  const getHighestRiskLevel = () => {
    const levels = ["CRITICAL", "HIGH", "MODERATE", "LOW"] as const;
    for (const level of levels) {
      if (ZONES.some((z: Zone) => z.level === level)) return level;
    }
    return "LOW";
  };

  const highestRisk = getHighestRiskLevel();

  return (
    <div
      className="live-ticker-banner"
      style={{ backgroundColor: LEVEL_COLORS[highestRisk] }}
    >
      <div className="live-ticker-label">
        <span className="live-pulse">●</span> LIVE
      </div>
      <div className="live-ticker-content">
        <div className="live-ticker-scroll">
          {tickerText}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{tickerText}
        </div>
      </div>
    </div>
  );
}
