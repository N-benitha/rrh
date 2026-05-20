import { useState, useEffect } from "react";
import { LineChart, BarChart } from "../../components/dashboard/Charts";
import { ZONES, RAINFALL_DATA, ML_HISTORY } from "../../constants";
import { apiService } from "../../services/api";

// Per-sensor river level — last 24 h (2-hour intervals)
const SENSOR_RIVER: Record<number, { t: string; v: number }[]> = {
  1: [ // SEBY-DS-03 Downstream — climbs to CRITICAL
    { t: "00:00", v: 1.4 }, { t: "02:00", v: 1.6 }, { t: "04:00", v: 1.7 },
    { t: "06:00", v: 1.9 }, { t: "08:00", v: 2.0 }, { t: "10:00", v: 2.2 },
    { t: "12:00", v: 2.3 }, { t: "14:00", v: 2.4 }, { t: "16:00", v: 2.6 },
    { t: "18:00", v: 2.7 }, { t: "20:00", v: 2.8 }, { t: "Now",   v: 2.8 },
  ],
  2: [ // SEBY-MS-02 Midstream — HIGH
    { t: "00:00", v: 1.2 }, { t: "02:00", v: 1.3 }, { t: "04:00", v: 1.4 },
    { t: "06:00", v: 1.5 }, { t: "08:00", v: 1.6 }, { t: "10:00", v: 1.7 },
    { t: "12:00", v: 1.8 }, { t: "14:00", v: 1.9 }, { t: "16:00", v: 2.0 },
    { t: "18:00", v: 2.0 }, { t: "20:00", v: 2.1 }, { t: "Now",   v: 2.1 },
  ],
  3: [ // SEBY-US-01 Upstream — MODERATE
    { t: "00:00", v: 0.8 }, { t: "02:00", v: 0.9 }, { t: "04:00", v: 0.9 },
    { t: "06:00", v: 1.0 }, { t: "08:00", v: 1.1 }, { t: "10:00", v: 1.1 },
    { t: "12:00", v: 1.2 }, { t: "14:00", v: 1.3 }, { t: "16:00", v: 1.3 },
    { t: "18:00", v: 1.4 }, { t: "20:00", v: 1.4 }, { t: "Now",   v: 1.4 },
  ],
};

// Per-sensor hourly rainfall today
const SENSOR_RAINFALL_TODAY: Record<number, { day: string; mm: number }[]> = {
  1: [
    { day: "06h", mm: 42 }, { day: "08h", mm: 55 }, { day: "10h", mm: 63 },
    { day: "12h", mm: 70 }, { day: "14h", mm: 79 }, { day: "16h", mm: 85 },
    { day: "Now", mm: 85 },
  ],
  2: [
    { day: "06h", mm: 30 }, { day: "08h", mm: 38 }, { day: "10h", mm: 48 },
    { day: "12h", mm: 55 }, { day: "14h", mm: 61 }, { day: "16h", mm: 68 },
    { day: "Now", mm: 68 },
  ],
  3: [
    { day: "06h", mm: 22 }, { day: "08h", mm: 28 }, { day: "10h", mm: 35 },
    { day: "12h", mm: 42 }, { day: "14h", mm: 48 }, { day: "16h", mm: 52 },
    { day: "Now", mm: 52 },
  ],
};

const LEVEL_COLOR: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH:     "#F97316",
  MODERATE: "#EAB308",
  LOW:      "#22C55E",
};

const PLACE: Record<number, string> = {
  1: "Kanama (Downstream)",
  2: "Nyundo (Midstream)",
  3: "Rutsiro (Upstream)",
};

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

  const zone = ZONES.find((z) => z.id === selectedZone) ?? ZONES[0];
  const riverData = SENSOR_RIVER[selectedZone] ?? SENSOR_RIVER[1];
  const rainfallToday = SENSOR_RAINFALL_TODAY[selectedZone] ?? SENSOR_RAINFALL_TODAY[1];

  const totalRisk    = Math.round(ZONES.reduce((sum, z) => sum + z.score, 0) / ZONES.length);
  const criticalCount = ZONES.filter((z) => z.level === "CRITICAL").length;
  const avgRainfall  = Math.round(rainfallData.reduce((sum, d) => sum + d.mm, 0) / (rainfallData.length || 1));

  return (
    <div className="db-analytics">

      {/* ── Key Metrics ── */}
      <div className="ana-metrics">
        <div className="ana-metric-card">
          <div className="ana-metric-label">⚠️ Avg Risk Score</div>
          <div className="ana-metric-val">{totalRisk}%</div>
          <div className="ana-metric-change positive">↑ Rising trend today</div>
        </div>
        <div className="ana-metric-card">
          <div className="ana-metric-label">🔴 Critical Sensors</div>
          <div className="ana-metric-val" style={{ color: "#DC2626" }}>{criticalCount}</div>
          <div className="ana-metric-change">of {ZONES.length} Sebeya sensors</div>
        </div>
        <div className="ana-metric-card">
          <div className="ana-metric-label">🌧️ Avg Rainfall (7d)</div>
          <div className="ana-metric-val">{avgRainfall}mm</div>
          <div className="ana-metric-change" style={{ color: rainfallSource === "NASA POWER" ? "#10B981" : undefined }}>
            {rainfallSource === "NASA POWER" ? "● Live NASA POWER" : "Mock data"}
          </div>
        </div>
        <div className="ana-metric-card">
          <div className="ana-metric-label">🤖 ML Accuracy</div>
          <div className="ana-metric-val">91%</div>
          <div className="ana-metric-change positive">Random Forest · Sebeya</div>
        </div>
      </div>

      {/* ── Sensor selector ── */}
      <div className="ana-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 className="ana-panel-title" style={{ marginBottom: 0 }}>📍 Sebeya Sensor Analysis</h2>
          <div style={{ display: "flex", gap: 8 }}>
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
          {ZONES.map((z) => (
            <div
              key={z.id}
              className={`ana-zone-card ${selectedZone === z.id ? "selected" : ""}`}
              onClick={() => setSelectedZone(z.id)}
            >
              <div className="ana-zone-header">
                <h3>{z.name}</h3>
                <span className="ana-zone-badge" style={{ background: LEVEL_COLOR[z.level] }}>
                  {z.level}
                </span>
              </div>
              <div className="ana-zone-stats">
                <div>
                  <div className="ana-zone-stat-val">{z.score}%</div>
                  <div className="ana-zone-stat-lbl">⚠️ Risk</div>
                </div>
                <div>
                  <div className="ana-zone-stat-val">{z.rainfall}</div>
                  <div className="ana-zone-stat-lbl">🌧️ Rain</div>
                </div>
                <div>
                  <div className="ana-zone-stat-val">{z.river}</div>
                  <div className="ana-zone-stat-lbl">💧 Level</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts row — driven by selected sensor ── */}
      <div className="ana-row-2">
        {/* River level 24h */}
        <div className="ana-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 className="ana-panel-title" style={{ marginBottom: 0 }}>
              💧 River Level — 24h · {PLACE[selectedZone]}
            </h2>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
              background: LEVEL_COLOR[zone.level] + "22",
              color: LEVEL_COLOR[zone.level],
              border: `1px solid ${LEVEL_COLOR[zone.level]}55`,
            }}>
              {zone.level} · {zone.river}
            </span>
          </div>
          <LineChart data={riverData} color={LEVEL_COLOR[zone.level]} unit="m" />
          <div style={{ fontSize: 10, color: "#999", marginTop: 6 }}>
            Critical threshold: <strong style={{ color: "#ef4444" }}>2.5m</strong>
            {parseFloat(zone.river) >= 2.5 && (
              <span style={{ color: "#ef4444", fontWeight: 700, marginLeft: 8 }}>
                ⚠ EXCEEDED
              </span>
            )}
          </div>
        </div>

        {/* Hourly rainfall today for selected sensor */}
        <div className="ana-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 className="ana-panel-title" style={{ marginBottom: 0 }}>
              🌧️ Hourly Rainfall Today · {PLACE[selectedZone]}
            </h2>
            <span style={{ fontSize: 10, color: "#999" }}>mm/h</span>
          </div>
          <BarChart data={rainfallToday} />
          <div style={{ fontSize: 10, color: "#999", marginTop: 6 }}>
            Critical threshold: <strong style={{ color: "#ef4444" }}>70 mm/h</strong>
            {parseFloat(zone.rainfall) >= 70 && (
              <span style={{ color: "#ef4444", fontWeight: 700, marginLeft: 8 }}>
                ⚠ EXCEEDED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Weekly rainfall (NASA POWER / mock) ── */}
      <div className="ana-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 className="ana-panel-title" style={{ marginBottom: 0 }}>
            🌧️ Weekly Rainfall — Sebeya Basin (7-day average)
          </h2>
          <span style={{
            fontSize: 11, fontFamily: "var(--mono)",
            padding: "3px 8px", borderRadius: 4,
            background: rainfallSource === "NASA POWER" ? "#d1fae5" : "#f3f4f6",
            color:      rainfallSource === "NASA POWER" ? "#065f46" : "#6b7280",
            border: `1px solid ${rainfallSource === "NASA POWER" ? "#6ee7b7" : "#e5e7eb"}`,
          }}>
            {rainfallLoading ? "Fetching…" : rainfallSource === "NASA POWER" ? "● NASA POWER Live" : "Mock data"}
          </span>
        </div>
        <BarChart data={rainfallData} />
      </div>

      {/* ── Sensor comparison table ── */}
      <div className="ana-panel">
        <h2 className="ana-panel-title">📊 Sebeya Sensor Comparison</h2>
        <table className="ana-comparison-table">
          <thead>
            <tr>
              <th>Sensor ID</th>
              <th>Location</th>
              <th>Risk Level</th>
              <th>Score</th>
              <th>Rainfall</th>
              <th>River Level</th>
              <th>Trend</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ZONES.map((z) => (
              <tr
                key={z.id}
                style={{ cursor: "pointer", background: selectedZone === z.id ? "rgba(59,130,246,0.06)" : undefined }}
                onClick={() => setSelectedZone(z.id)}
              >
                <td className="ana-mono" style={{ fontWeight: 700 }}>{z.name.split("—")[0].trim()}</td>
                <td className="ana-zone-name">{PLACE[z.id]}</td>
                <td>
                  <span className="ana-risk-badge" style={{ background: LEVEL_COLOR[z.level] }}>
                    {z.level}
                  </span>
                </td>
                <td className="ana-mono">{z.score}%</td>
                <td className="ana-mono">{z.rainfall}</td>
                <td className="ana-mono" style={{ color: parseFloat(z.river) >= 2.5 ? "#ef4444" : undefined, fontWeight: parseFloat(z.river) >= 2.5 ? 700 : undefined }}>
                  {z.river}{parseFloat(z.river) >= 2.5 ? " ⚠" : ""}
                </td>
                <td>
                  <span style={{ color: z.trend === "up" ? "#DC2626" : z.trend === "dn" ? "#059669" : "#999" }}>
                    {z.trend === "up" ? "↑ Rising" : z.trend === "dn" ? "↓ Falling" : "→ Stable"}
                  </span>
                </td>
                <td style={{ color: "#059669", fontWeight: 600 }}>● Online</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ML Model accuracy ── */}
      <div className="ana-panel">
        <h2 className="ana-panel-title">🤖 ML Model Accuracy — 7-Day Trend (Random Forest · Sebeya)</h2>
        <LineChart data={ML_HISTORY.map((h) => ({ t: h.date, v: h.acc }))} color="#10B981" unit="%" />
        <div style={{ fontSize: 10, color: "#999", marginTop: 6 }}>
          Trained on NASA POWER historical rainfall + Sebeya river level data (2010–2023) · 91.4% accuracy
        </div>
      </div>

    </div>
  );
}
