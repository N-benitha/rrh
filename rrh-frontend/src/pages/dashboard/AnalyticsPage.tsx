import { useState, useEffect } from "react";
import { LineChart, BarChart } from "../../components/dashboard/Charts";
import { ZONES, RAINFALL_DATA, RIVER_DATA, ML_HISTORY } from "../../constants";
import { apiService } from "../../services/api";

export default function AnalyticsPage() {
  const [selectedZone, setSelectedZone] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  const [rainfallData, setRainfallData] = useState<{ day: string; mm: number }[]>(
    RAINFALL_DATA.map((d) => ({ day: d.day, mm: d.mm }))
  );
  const [rainfallSource, setRainfallSource] = useState<"mock" | "NASA POWER">("mock");
  const [rainfallLoading, setRainfallLoading] = useState(true);

  useEffect(() => {
    setRainfallLoading(true);
    apiService
      .getNasaRainfall(7)
      .then((res) => {
        if (res.rainfall && res.rainfall.length > 0) {
          setRainfallData(res.rainfall);
          setRainfallSource("NASA POWER");
        }
      })
      .catch(() => {/* keep mock */})
      .finally(() => setRainfallLoading(false));
  }, []);

  const totalRisk = Math.round(ZONES.reduce((sum, z) => sum + z.score, 0) / ZONES.length);
  const criticalCount = ZONES.filter((z) => z.level === "CRITICAL").length;
  const avgRainfall = Math.round(rainfallData.reduce((sum, d) => sum + d.mm, 0) / (rainfallData.length || 1));

  return (
    <div className="db-analytics">
      {/* Key Metrics */}
      <div className="ana-metrics">
        <div className="ana-metric-card">
          <div className="ana-metric-label">⚠️ Avg Risk Score</div>
          <div className="ana-metric-val">{totalRisk}%</div>
          <div className="ana-metric-change positive">↑ 2.3% this week</div>
        </div>
        <div className="ana-metric-card">
          <div className="ana-metric-label">🔴 Critical Zones</div>
          <div className="ana-metric-val" style={{ color: "#DC2626" }}>
            {criticalCount}
          </div>
          <div className="ana-metric-change">Out of {ZONES.length} zones</div>
        </div>
        <div className="ana-metric-card">
          <div className="ana-metric-label">🌧️ Avg Rainfall</div>
          <div className="ana-metric-val">{avgRainfall}mm</div>
          <div className="ana-metric-change" style={{ color: rainfallSource === "NASA POWER" ? "#10B981" : undefined }}>
            {rainfallSource === "NASA POWER" ? "● Live NASA POWER" : "Mock data"}
          </div>
        </div>
        <div className="ana-metric-card">
          <div className="ana-metric-label">🤖 Model Accuracy</div>
          <div className="ana-metric-val">91%</div>
          <div className="ana-metric-change positive">↑ 0.8% this week</div>
        </div>
      </div>

      {/* Main Analytics */}
      <div className="ana-row-2">
        {/* Rainfall Trends */}
        <div className="ana-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h2 className="ana-panel-title" style={{ marginBottom: 0 }}>🌧️ Weekly Rainfall Distribution</h2>
            <span style={{
              fontSize: "11px",
              fontFamily: "var(--mono)",
              padding: "3px 8px",
              borderRadius: "4px",
              background: rainfallSource === "NASA POWER" ? "#d1fae5" : "#f3f4f6",
              color: rainfallSource === "NASA POWER" ? "#065f46" : "#6b7280",
              border: `1px solid ${rainfallSource === "NASA POWER" ? "#6ee7b7" : "#e5e7eb"}`,
            }}>
              {rainfallLoading ? "Fetching…" : rainfallSource === "NASA POWER" ? "● NASA POWER Live" : "Mock data"}
            </span>
          </div>
          <BarChart data={rainfallData} />
        </div>

        {/* River Level Forecast */}
        <div className="ana-panel">
          <h2 className="ana-panel-title">💧 River Level Forecast - 24h</h2>
          <LineChart data={RIVER_DATA} color="#3B82F6" unit="m" />
        </div>
      </div>

      {/* Zone Selection & Analysis */}
      <div className="ana-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 className="ana-panel-title">📍 Zone Analysis</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {["24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                className={`ana-time-btn ${timeRange === range ? "active" : ""}`}
                onClick={() => setTimeRange(range as "24h" | "7d" | "30d")}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="ana-zone-grid">
          {ZONES.map((zone) => (
            <div
              key={zone.id}
              className={`ana-zone-card ${selectedZone === zone.id ? "selected" : ""}`}
              onClick={() => setSelectedZone(zone.id)}
            >
              <div className="ana-zone-header">
                <h3>{zone.name}</h3>
                <span
                  className="ana-zone-badge"
                  style={{
                    background:
                      zone.level === "CRITICAL"
                        ? "#DC2626"
                        : zone.level === "HIGH"
                          ? "#F97316"
                          : zone.level === "MODERATE"
                            ? "#EAB308"
                            : "#059669",
                  }}
                >
                  {zone.level}
                </span>
              </div>
              <div className="ana-zone-stats">
                <div>
                  <div className="ana-zone-stat-val">{zone.score}%</div>
                  <div className="ana-zone-stat-lbl">⚠️ Risk</div>
                </div>
                <div>
                  <div className="ana-zone-stat-val">{zone.rainfall}</div>
                  <div className="ana-zone-stat-lbl">🌧️ Rainfall</div>
                </div>
                <div>
                  <div className="ana-zone-stat-val">{zone.river}</div>
                  <div className="ana-zone-stat-lbl">💧 River</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML Model Performance */}
      <div className="ana-panel">
        <h2 className="ana-panel-title">🤖 ML Model Accuracy - 7 Day Trend</h2>
        <LineChart data={ML_HISTORY.map((h) => ({ t: h.date, v: h.acc }))} color="#10B981" unit="%" />
      </div>

      {/* Comparison Table */}
      <div className="ana-panel">
        <h2 className="ana-panel-title">📊 All Zones Comparison</h2>
        <table className="ana-comparison-table">
          <thead>
            <tr>
              <th>Zone Name</th>
              <th>Risk Level</th>
              <th>Score</th>
              <th>Rainfall</th>
              <th>River</th>
              <th>Trend</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ZONES.map((zone) => (
              <tr key={zone.id}>
                <td className="ana-zone-name">{zone.name}</td>
                <td>
                  <span
                    className="ana-risk-badge"
                    style={{
                      background:
                        zone.level === "CRITICAL"
                          ? "#DC2626"
                          : zone.level === "HIGH"
                            ? "#F97316"
                            : zone.level === "MODERATE"
                              ? "#EAB308"
                              : "#059669",
                    }}
                  >
                    {zone.level}
                  </span>
                </td>
                <td className="ana-mono">{zone.score}%</td>
                <td className="ana-mono">{zone.rainfall}</td>
                <td className="ana-mono">{zone.river}</td>
                <td>
                  <span style={{ color: zone.trend === "up" ? "#DC2626" : zone.trend === "dn" ? "#059669" : "#999" }}>
                    {zone.trend === "up" ? "↑" : zone.trend === "dn" ? "↓" : "→"}
                  </span>
                </td>
                <td style={{ color: "#059669", fontWeight: "600" }}>● Online</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
