import { useAlerts } from "../../hooks/useData";

const LEVEL_MSG: Record<string, string> = {
  critical: "🔴 CRITICAL FLOOD RISK",
  high:     "🟠 HIGH FLOOD RISK",
  moderate: "🟡 Moderate risk detected",
  low:      "✅ Normal conditions",
};

export default function LiveTickerBanner() {
  const { alerts, source } = useAlerts();

  const isLive = source !== "mock";
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let tickerItems: string[];

  if (isLive && alerts.length > 0) {
    tickerItems = [
      `📡 Sebeya River Basin — Live monitoring active`,
      ...alerts.map((a) =>
        `${LEVEL_MSG[a.level] ?? "⚠️ Alert"} — ${a.zone} — ${a.description ?? a.title}`
      ),
      `🕐 Last updated ${now} UTC`,
      `↻ Data refreshes every 5 minutes`,
    ];
  } else {
    tickerItems = [
      "📡 Sebeya River Basin — Live monitoring active",
      "✅ Kanama/Rubavu (Downstream) — Normal water levels, no flood risk",
      "✅ Nyundo (Midstream) — River within safe range",
      "✅ Rutsiro (Upstream) — All sensors operational",
      `🕐 Last checked ${now} UTC`,
      "↻ Powered by OpenWeather — Updates every 5 minutes",
    ];
  }

  const SEP = "     ◆◆◆     ";

  return (
    <div className="live-ticker-banner" style={{ backgroundColor: "#1a3a6c" }}>
      <div className="live-ticker-label">
        <span className="live-pulse">●</span> LIVE
      </div>
      <div className="live-ticker-content">
        <div className="live-ticker-scroll">
          {tickerItems.map((item, i) => (
            <span key={i}>
              <span style={{ color: "#fff", fontWeight: 700 }}>{item}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", margin: "0 8px" }}>{SEP}</span>
            </span>
          ))}
          {tickerItems.map((item, i) => (
            <span key={`r-${i}`}>
              <span style={{ color: "#fff", fontWeight: 700 }}>{item}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", margin: "0 8px" }}>{SEP}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
