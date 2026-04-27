import { useState } from "react";
import DashMap from "../../components/dashboard/DashMap";
import { BarChart, LineChart } from "../../components/dashboard/Charts";
import StatCards from "../../components/dashboard/StatCards";
import AlertsList from "../../components/dashboard/AlertsList";
import { useDashboardStats, useZones, useAlerts, useAnalytics } from "../../hooks/useData";
import { RAINFALL_DATA, RIVER_DATA, ML_HISTORY, LEVEL_COLORS } from "../../constants";
import type { StatCardItem, Zone } from "../../types";
import type { Alert } from "../../types";

const TREND_ICON: Record<string, string> = { up: "▲", dn: "▼", st: "●" };
const TREND_COLOR: Record<string, string> = { up: "#ef4444", dn: "#22c55e", st: "#f59e0b" };
const CHIP: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: "#7f1d1d", color: "#fca5a5" },
  HIGH:     { bg: "#7c2d12", color: "#fdba74" },
  MODERATE: { bg: "#713f12", color: "#fde68a" },
  LOW:      { bg: "#14532d", color: "#6ee7b7" },
};

type RainfallPoint = { day: string; mm: number };
type RiverPoint    = { t: string; v: number };
type MlPoint       = { date: string; acc: number };

export default function DashboardOverview() {
  const { data: stats } = useDashboardStats();
  const { zones } = useZones();
  const { alerts } = useAlerts();
  const { data: analytics } = useAnalytics("7d");

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

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

  const rainfallData: RainfallPoint[] = analytics?.rainfall?.length
    ? analytics.rainfall
    : RAINFALL_DATA.map((d: RainfallPoint) => ({ day: d.day, mm: d.mm }));

  const riverData: RiverPoint[] = analytics?.river?.length
    ? analytics.river
    : RIVER_DATA;

  const mlData: RiverPoint[] = analytics?.ml_history?.length
    ? analytics.ml_history.map((h: MlPoint) => ({ t: h.date, v: h.acc }))
    : ML_HISTORY.map((h) => ({ t: h.date, v: h.acc }));

  const handleAlertClick = (alert: Alert) => {
    const alertFirst = alert.zone.split(" ")[0].toLowerCase();
    const match =
      zones.find(
        (z: Zone) =>
          z.name.toLowerCase().includes(alertFirst) ||
          alertFirst.includes(z.name.split(" ")[0].toLowerCase())
      ) ?? null;
    setSelectedZone((prev) => (prev?.id === match?.id ? null : match));
  };

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
                <DashMap zones={zones} onZoneSelect={setSelectedZone} />
              </div>
              <div className="db-map-legend">
                <div className="db-mleg-title">Risk Level</div>
                {(["CRITICAL", "HIGH", "MODERATE", "LOW"] as const).map((level) => (
                  <div className="db-mleg-row" key={level}>
                    <div className="db-mleg-dot" style={{ background: LEVEL_COLORS[level] }} />
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
              <p className="db-panel-subtitle">Click an alert to see zone details</p>
            </div>
            <span className="db-badge warn">{alerts.length} active</span>
          </div>
          <div className="db-panel-body">
            <AlertsList
              alerts={alerts.map((a) => ({
                level: a.level,
                title: a.title,
                description: a.description,
                zone: a.zone,
                time: a.time,
              }))}
              limit={4}
              selectedZone={selectedZone?.name ?? null}
              onAlertClick={handleAlertClick}
            />

            {selectedZone && (() => {
              const chip = CHIP[selectedZone.level] ?? CHIP.LOW;
              const pct  = Math.min(100, (parseFloat(selectedZone.river) / 6) * 100);
              const rCol = LEVEL_COLORS[selectedZone.level] ?? "#22c55e";
              return (
                <div className="zd-mini-card">
                  <div className="zd-mini-head">
                    <div>
                      <p className="zd-mini-name">{selectedZone.name}</p>
                      <p className="zd-mini-region">{selectedZone.region}</p>
                      <span className="zd-mini-chip" style={{ background: chip.bg, color: chip.color }}>
                        {selectedZone.level}
                      </span>
                    </div>
                    <button className="zd-mini-close" onClick={() => setSelectedZone(null)}>×</button>
                  </div>

                  <div className="zd-mini-metrics">
                    <div className="zd-mini-metric">
                      <div className="zd-mini-metric-lbl">Rainfall</div>
                      <div className="zd-mini-metric-val">
                        {selectedZone.rainfall}
                        <span className="zd-mini-trend" style={{ color: TREND_COLOR[selectedZone.trend] }}>
                          {TREND_ICON[selectedZone.trend]}
                        </span>
                      </div>
                    </div>
                    <div className="zd-mini-metric">
                      <div className="zd-mini-metric-lbl">River Level</div>
                      <div className="zd-mini-metric-val">
                        {selectedZone.river}
                        <span className="zd-mini-trend" style={{ color: TREND_COLOR[selectedZone.trend] }}>
                          {TREND_ICON[selectedZone.trend]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="zd-mini-bar-wrap">
                    <div className="zd-mini-bar-lbl">River level — capacity</div>
                    <div className="zd-mini-bar-row">
                      <div className="zd-mini-bar-track">
                        <div className="zd-mini-bar-fill" style={{ width: `${pct}%`, background: rCol }} />
                      </div>
                      <span className="zd-mini-bar-pct" style={{ color: rCol }}>{Math.round(pct)}%</span>
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>
                      {selectedZone.trend === "up" ? "▲ Rising" : selectedZone.trend === "dn" ? "▼ Falling" : "● Stable"} · threshold 5.5m
                    </div>
                  </div>

                  <div className="zd-mini-score-wrap">
                    <div className="zd-mini-score-row">
                      <span className="zd-mini-score-lbl">ML Flood Risk Score</span>
                      <span className="zd-mini-score-val">{selectedZone.score}%</span>
                    </div>
                    <div className="zd-mini-score-track">
                      <div className="zd-mini-score-fill" style={{ width: `${selectedZone.score}%`, background: rCol }} />
                    </div>
                  </div>

                  <div className="zd-mini-desc">{selectedZone.desc}</div>
                  <div className="zd-mini-updated">Last updated: {selectedZone.updated}</div>
                </div>
              );
            })()}
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
              {zones.map((zone: Zone) => (
                <tr key={zone.id}>
                  <td className="db-zone-name">{zone.name}</td>
                  <td>{zone.region}</td>
                  <td>
                    <span
                      className="db-risk-badge"
                      style={{ background: LEVEL_COLORS[zone.level] }}
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
