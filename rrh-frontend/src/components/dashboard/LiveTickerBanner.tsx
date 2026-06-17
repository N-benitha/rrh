import { useAlerts } from "../../hooks/useData";
import { ZONES } from "../../constants";
import type { Zone } from "../../types";

const LEVEL_ICON: Record<string, string> = {
  critical: "🔴",
  high:     "⚠️",
  moderate: "ℹ️",
  low:      "✓",
};

export default function LiveTickerBanner() {
  const { alerts } = useAlerts();

  const isLive = alerts.length > 0;

  let tickerItems: string[];

  if (isLive) {
    tickerItems = [
      "● LIVE", 
      ...alerts.map(
        (a) =>
          `${LEVEL_ICON[a.level] ?? "⚠️"} ${a.title} · ${a.zone} · ${a.time}`
      ),
      "↻ Updates every 5 min",
    ];
  } else {
    // Fallback: mock zones + alerts until real data arrives
    tickerItems = [
      "🔴 LIVE",
      ...ZONES.map(
        (z: Zone) =>
          `${z.score}% Risk · ${z.name} · ${z.rainfall}/day · River ${z.river}`
      ),
      "↻ Updates every 5 min",
    ];
  }

  const tickerText = tickerItems.join("   •   ");

  return (
    <div className="live-ticker-banner" style={{ backgroundColor: "#1a3a6c" }}>
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
