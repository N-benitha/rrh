import DashMap from "./DashMap";
import { BarChart, LineChart } from "./Charts";
import StatCards from "./StatCards";
import AlertsList from "./AlertsList";
import { useDashboardStats, useZones, useAlerts, useAnalytics } from "../../hooks/useData";
import { RAINFALL_DATA, RIVER_DATA, ML_HISTORY } from "../../constants";
import type { StatCardItem } from "../../types";

export default function DashboardOverview() {
  const { data: stats } = useDashboardStats();
  const { zones } = useZones();
  const { alerts } = useAlerts();
  const { data: analytics } = useAnalytics("7d");

  const statCards: StatCardItem[] = [
    {
      label: "Active Alerts",
      value: stats ? String(stats.active_alerts) : "—",
      change: "Real-time count",
      trend: "up",
      type: "alert",
    },
    {
      label: "Critical Zones",
      value: stats ? String(stats.critical_zones) : "—",
      change: "Requiring attention",
      trend: "stable",
      type: "zone",
    },
    {
      label: "ML Accuracy",
      value: stats ? `${stats.ml_accuracy_pct}%` : "—",
      change: "Avg confidence score",
      trend: "up",
      type: "accuracy",
    },
    {
      label: "Avg Rainfall 24h",
      value: stats ? `${stats.avg_rainfall_mm}mm` : "—",
      change: "Across all zones",
      trend: "up",
      type: "rainfall",
    },
  ];

  const levelColors: Record<string, string> = {
    CRITICAL: "#EF4444",
    HIGH: "#F97316",
    MODERATE: "#EAB308",
    LOW: "#22C55E",
  };

  const rainfallData = analytics?.rainfall?.length
    ? analytics.rainfall
    : RAINFALL_DATA.map((d: any) => ({ day: d.day, mm: d.mm }));

  const riverData = analytics?.river?.length
    ? analytics.river
    : RIVER_DATA;

  const mlData = analytics?.ml_history?.length
    ? analytics.ml_history.map((h: any) => ({ t: h.date, v: h.acc }))
    : ML_HISTORY.map((h) => ({ t: h.date, v: h.acc }));

  return (
    <div className="db-overview-page">
      <StatCards stats={statCards} />

      <div className="db-row-2">
        <div className="db-panel">
          <div className="db-panel-header">
            <div>
              <h3 className="db-panel-title">Live Risk Map</h3>
              <p className="db-panel-subtitle">Click pins for zone detail</p>
            </div>
            <span className="db-badge live">● LIVE</span>
          </div>
          <div className="db-panel-body">
            <div className="db-map-wrap">
              <div className="db-map-inner" style={{ height: "350px" }}>
                <DashMap zones={zones} />
              </div>
              <div className="db-map-legend">
                <div className="db-mleg-title">Risk Level</div>
                {(["CRITICAL", "HIGH", "MODERATE", "LOW"] as const).map((level) => (
                  <div className="db-mleg-row" key={level}>
                    <div className="db-mleg-dot" style={{ background: levelColors[level] }} />
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="db-panel">
          <div className="db-panel-header">
            <div>
              <h3 className="db-panel-title">Active Alerts</h3>
              <p className="db-panel-subtitle">Real-time notifications</p>
            </div>
            <span className="db-badge warn">{alerts.length} active</span>
          </div>
          <div className="db-panel-body">
            <AlertsList
              alerts={alerts.map((a) => ({
                level: a.level,
                icon: a.icon,
                title: a.title,
                description: a.description,
                zone: a.zone,
                time: a.time,
              }))}
              limit={4}
            />
          </div>
        </div>
      </div>

      <div className="db-row-2">
        <div className="db-panel">
          <div className="db-panel-header">
            <h3 className="db-panel-title">Weekly Rainfall Trend</h3>
            <p className="db-panel-subtitle">7-day rainfall distribution by zone</p>
          </div>
          <div className="db-panel-body">
            <BarChart data={rainfallData} />
          </div>
        </div>

        <div className="db-panel">
          <div className="db-panel-header">
            <h3 className="db-panel-title">River Level Forecast</h3>
            <p className="db-panel-subtitle">Nyabarongo River — Last 24h trend</p>
          </div>
          <div className="db-panel-body">
            <LineChart data={riverData} color="#3B82F6" unit="m" />
          </div>
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <h3 className="db-panel-title">Monitored Risk Zones</h3>
          <p className="db-panel-subtitle">Real-time data from {zones.length} zones across Rwanda</p>
        </div>
        <div className="db-panel-body">
          <table className="db-zone-table">
            <thead>
              <tr>
                <th>Zone Name</th>
                <th>Region</th>
                <th>Risk Level</th>
                <th>Rainfall</th>
                <th>River Level</th>
                <th>ML Score</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone: any) => (
                <tr key={zone.id}>
                  <td className="db-zone-name">{zone.name}</td>
                  <td>{zone.region}</td>
                  <td>
                    <span
                      className="db-risk-badge"
                      style={{ background: levelColors[zone.level] }}
                    >
                      {zone.level}
                    </span>
                  </td>
                  <td className="db-mono">{zone.rainfall}</td>
                  <td className="db-mono">{zone.river}</td>
                  <td className="db-mono">{zone.score}%</td>
                  <td className="db-time">{zone.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <h3 className="db-panel-title">ML Model Performance</h3>
          <p className="db-panel-subtitle">Classification accuracy over time</p>
        </div>
        <div className="db-panel-body">
          <LineChart data={mlData} color="#10B981" unit="%" title="Accuracy %" />
        </div>
      </div>
    </div>
  );
}
