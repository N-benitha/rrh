import { useState, Fragment } from "react";
import DashMap from "../../components/dashboard/DashMap";
import { BarChart, LineChart } from "../../components/dashboard/Charts";
import StatCards from "../../components/dashboard/StatCards";
import AlertsList from "../../components/dashboard/AlertsList";
import { useDashboardStats, useZones, useAlerts, useAnalytics, usePredictions } from "../../hooks/useData";
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
  const { data: predictions, loading: predLoading } = usePredictions();

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [tableExpandedZoneId, setTableExpandedZoneId] = useState<number | null>(null);

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
              <h3 className="db-panel-title">🗺️ Live Risk Map</h3>
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
              <h3 className="db-panel-title">🚨 Active Alerts</h3>
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
              const pct  = Math.min(100, (parseFloat(selectedZone.river) / 3.5) * 100);
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
                      {selectedZone.trend === "up" ? "▲ Rising" : selectedZone.trend === "dn" ? "▼ Falling" : "● Stable"} · critical threshold 2.5m
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
            <h3 className="db-panel-title">🌧️ Weekly Rainfall — Sebeya Basin</h3>
            <p className="db-panel-subtitle">7-day totals · critical threshold 70mm/h</p>
          </div>
          <div className="db-panel-body">
            <BarChart data={rainfallData} />
          </div>
        </div>

        <div className="db-panel">
          <div className="db-panel-header">
            <h3 className="db-panel-title">💧 River Level — Sebeya (Downstream)</h3>
            <p className="db-panel-subtitle">SEBY-DS-03 Kanama/Rubavu · critical threshold 2.5m</p>
          </div>
          <div className="db-panel-body">
            <LineChart data={riverData} color="#3B82F6" unit="m" />
          </div>
        </div>
      </div>

      {/* ML Basin Predictions */}
      <div className="db-panel">
        <div className="db-panel-header">
          <div>
            <h3 className="db-panel-title">🤖 ML Flood Risk Predictions</h3>
            <p className="db-panel-subtitle">
              Random Forest · {predictions ? predictions.weather_source : "loading…"}
            </p>
          </div>
          {predictions && (
            <span className="db-badge" style={{
              background: predictions.weather_source === "OpenWeather Live" ? "#14532d" : "#1e3a5f",
              color: predictions.weather_source === "OpenWeather Live" ? "#6ee7b7" : "#93c5fd",
            }}>
              {predictions.weather_source === "OpenWeather Live" ? "● Live" : "● Typical values"}
            </span>
          )}
        </div>
        <div className="db-panel-body">
          {predLoading ? (
            <div style={{ color: "rgba(255,255,255,.4)", fontFamily: "var(--mono)", fontSize: 14, padding: "20px 0" }}>
              Running predictions…
            </div>
          ) : predictions?.predictions?.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {predictions.predictions.map((p) => {
                const riskColor = p.risk_level === "high" ? "#ef4444"
                  : p.risk_level === "medium" ? "#f97316" : "#22c55e";
                const riskBg = p.risk_level === "high" ? "#450a0a"
                  : p.risk_level === "medium" ? "#431407" : "#052e16";
                return (
                  <div key={p.basin} style={{
                    background: "rgba(255,255,255,.04)",
                    border: `1px solid ${riskColor}44`,
                    borderRadius: 8,
                    padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
                        {p.basin}
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "var(--mono)", padding: "2px 7px",
                        borderRadius: 4, background: riskBg, color: riskColor, flexShrink: 0, marginLeft: 8 }}>
                        {p.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 10 }}>{p.zone}</div>

                    {/* Confidence bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "rgba(255,255,255,.35)" }}>Confidence</span>
                        <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: riskColor, fontWeight: 600 }}>{p.confidence}%</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${p.confidence}%`, background: riskColor, borderRadius: 2 }} />
                      </div>
                    </div>

                    {/* Key features */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
                      {[
                        ["🌧️", `${p.features.rainfall_24h}mm`, "Rain 24h"],
                        ["💧", `${p.features.water_level}m`, "Water"],
                        ["💧", `${p.features.humidity}%`, "Humidity"],
                        ["🌱", `${p.features.soil_saturation}%`, "Soil"],
                      ].map(([icon, val, lbl]) => (
                        <div key={lbl} style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                          {icon} <span style={{ color: "rgba(255,255,255,.7)" }}>{val}</span> {lbl}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>
              Backend offline — start the server to see live predictions.
            </div>
          )}
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <h3 className="db-panel-title">📍 Sebeya River — IoT Sensor Stations</h3>
          <p className="db-panel-subtitle">{zones.length} virtual sensors · SEBY-US-01 · SEBY-MS-02 · SEBY-DS-03 · click a row for details</p>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone: Zone) => {
                const isExpanded = tableExpandedZoneId === zone.id;
                const chip = CHIP[zone.level] ?? CHIP.LOW;
                const pct = Math.min(100, (parseFloat(zone.river) / 6) * 100);
                const rCol = LEVEL_COLORS[zone.level] ?? "#22c55e";
                return (
                  <Fragment key={zone.id}>
                    <tr
                      style={{ cursor: "pointer" }}
                      onClick={() => setTableExpandedZoneId(isExpanded ? null : zone.id)}
                    >
                      <td className="db-zone-name">{zone.name}</td>
                      <td>{zone.region}</td>
                      <td>
                        <span className="db-risk-badge" style={{ background: LEVEL_COLORS[zone.level] }}>
                          {zone.level}
                        </span>
                      </td>
                      <td className="db-mono">{zone.rainfall}</td>
                      <td className="db-mono">{zone.river}</td>
                      <td className="db-mono">{zone.score}%</td>
                      <td className="db-time">{zone.updated}</td>
                      <td>
                        <button
                          className="db-btn-sm"
                          onClick={(e) => { e.stopPropagation(); setTableExpandedZoneId(isExpanded ? null : zone.id); }}
                        >
                          {isExpanded ? "▲ Close" : "▼ Details"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0, background: "rgba(0,0,0,.15)" }}>
                          <div className="zd-mini-card" style={{ margin: 0, borderRadius: 0, border: "none", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                            <div className="zd-mini-head">
                              <div>
                                <p className="zd-mini-name">{zone.name}</p>
                                <p className="zd-mini-region">{zone.region}</p>
                                <span className="zd-mini-chip" style={{ background: chip.bg, color: chip.color }}>
                                  {zone.level}
                                </span>
                              </div>
                              <button className="zd-mini-close" onClick={() => setTableExpandedZoneId(null)}>×</button>
                            </div>
                            <div className="zd-mini-metrics">
                              <div className="zd-mini-metric">
                                <div className="zd-mini-metric-lbl">Rainfall</div>
                                <div className="zd-mini-metric-val">
                                  {zone.rainfall}
                                  <span className="zd-mini-trend" style={{ color: TREND_COLOR[zone.trend] }}>
                                    {TREND_ICON[zone.trend]}
                                  </span>
                                </div>
                              </div>
                              <div className="zd-mini-metric">
                                <div className="zd-mini-metric-lbl">River Level</div>
                                <div className="zd-mini-metric-val">
                                  {zone.river}
                                  <span className="zd-mini-trend" style={{ color: TREND_COLOR[zone.trend] }}>
                                    {TREND_ICON[zone.trend]}
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
                                {zone.trend === "up" ? "▲ Rising" : zone.trend === "dn" ? "▼ Falling" : "● Stable"} · critical threshold 2.5m
                              </div>
                            </div>
                            <div className="zd-mini-score-wrap">
                              <div className="zd-mini-score-row">
                                <span className="zd-mini-score-lbl">ML Flood Risk Score</span>
                                <span className="zd-mini-score-val">{zone.score}%</span>
                              </div>
                              <div className="zd-mini-score-track">
                                <div className="zd-mini-score-fill" style={{ width: `${zone.score}%`, background: rCol }} />
                              </div>
                            </div>
                            {zone.desc && <div className="zd-mini-desc">{zone.desc}</div>}
                            <div className="zd-mini-updated">Last updated: {zone.updated}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <h3 className="db-panel-title">🤖 ML Model Performance</h3>
          <p className="db-panel-subtitle">Classification accuracy over time</p>
        </div>
        <div className="db-panel-body">
          <LineChart data={mlData} color="#10B981" unit="%" title="Accuracy %" />
        </div>
      </div>
    </div>
  );
}
