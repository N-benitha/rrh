import { useEffect, useState } from "react";
import { ZONES, ALERTS } from "../../constants";

export default function LiveTickerBanner() {
  const [scroll, setScroll] = useState(0);

  // Generate ticker content from zones and alerts
  const tickerItems = [
    "🔴 LIVE",
    ...ZONES.map(
      (z: any) =>
        `${z.score}% Risk · ${z.name} · ${z.rainfall}mm/day · River ${z.water}m`
    ),
    ...ALERTS.slice(0, 2).map((a: any) => `⚠️ ${a.title} · ${a.zone}`),
    "↻ Updates every 5 min",
  ];

  const tickerText = tickerItems.join(" • ");

  useEffect(() => {
    const interval = setInterval(() => {
      setScroll((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const levelColors: { [key: string]: string } = {
    CRITICAL: "#DC2626",
    HIGH: "#F97316",
    MODERATE: "#EAB308",
    LOW: "#059669",
  };

  const getHighestRiskLevel = () => {
    const levels = ["CRITICAL", "HIGH", "MODERATE", "LOW"];
    for (const level of levels) {
      if (ZONES.some((z: any) => z.level === level)) {
        return level;
      }
    }
    return "LOW";
  };

  const highestRisk = getHighestRiskLevel();

  return (
    <div
      className="live-ticker-banner"
      style={{ backgroundColor: levelColors[highestRisk] || "#DC2626" }}
    >
      <div className="live-ticker-label">
        <span className="live-pulse">●</span> LIVE
      </div>
      <div className="live-ticker-content">
        <div
          className="live-ticker-scroll"
          style={{ transform: `translateX(-${scroll * 10}px)` }}
        >
          {tickerText} • {tickerText}
        </div>
      </div>
    </div>
  );
}
