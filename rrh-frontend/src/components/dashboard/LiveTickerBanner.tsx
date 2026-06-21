import { useAlerts } from "../../hooks/useData";

const LEVEL_ICON: Record<string, string> = {
  CRITICAL: "🔴",
  HIGH:     "⚠️",
  MODERATE: "ℹ️",
  LOW:      "✓",
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function LiveTickerBanner() {
  const { alerts, loading } = useAlerts();

  let tickerText: string;

  if (loading) {
    tickerText = "● Fetching live alerts…";
  } else if (alerts.length === 0) {
    tickerText = "✓ No active alerts at this time   •   All monitored zones nominal   •   ↻ Updates every 5 min";
  } else {
    const items = [
      "● LIVE",
      ...alerts.map(
        (a) =>
          `${LEVEL_ICON[a.risk_level] ?? "⚠️"} ${a.message} · ${a.region_name ?? a.region_id} · ${fmtTime(a.created_at)}`
      ),
      "↻ Updates every 5 min",
    ];
    tickerText = items.join("   •   ");
  }

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
