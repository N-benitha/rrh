import { useState } from "react";
import { ZONES, RAINFALL_DATA, RIVER_DATA, ML_HISTORY } from "../../constants";
import { LineChart, BarChart } from "../../components/dashboard/Charts";

type ZoneId = number;

interface ZoneDetailPageProps {
  zoneId: ZoneId;
  onBack: () => void;
}

export default function ZoneDetailPage({ zoneId, onBack }: ZoneDetailPageProps) {
  const [selectedMetric, setSelectedMetric] = useState<"rainfall" | "river" | "model">("rainfall");

  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) return <div>Zone not found</div>;

  const trendColor = zone.trend === "up" ? "#DC2626" : zone.trend === "dn" ? "#059669" : "#999";
  const riskColors: { [key: string]: string } = {
    CRITICAL: "#DC2626",
    HIGH: "#F97316",
    MODERATE: "#EAB308",
    LOW: "#059669",
  };

  return (
    <div className="db-zone-detail">
      {/* Header */}
      <div className="zd-header">
        <button className="zd-back-btn" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h1 className="zd-title">{zone.name}</h1>
          <p className="zd-region">{zone.region}</p>
        </div>
        <span className="zd-risk" style={{ background: riskColors[zone.level] }}>
          {zone.level}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="zd-metrics">
        <div className="zd-metric-card">
          <div className="zd-metric-label">Risk Score</div>
          <div className="zd-metric-value">{zone.score}%</div>
          <div className="zd-metric-change" style={{ color: trendColor }}>
            {zone.trend === "up" ? "↑" : zone.trend === "dn" ? "↓" : "→"} {zone.trend}
          </div>
        </div>

        <div className="zd-metric-card">
          <div className="zd-metric-label">Rainfall 24h</div>
          <div className="zd-metric-value">{zone.rainfall}</div>
          <div className="zd-metric-sub">mm/day</div>
        </div>

        <div className="zd-metric-card">
          <div className="zd-metric-label">River Level</div>
          <div className="zd-metric-value">{zone.river}</div>
          <div className="zd-metric-sub">meters</div>
        </div>

        <div className="zd-metric-card">
          <div className="zd-metric-label">Last Updated</div>
          <div className="zd-metric-value" style={{ fontSize: "14px" }}>
            {zone.updated}
          </div>
          <div className="zd-metric-sub">Real-time</div>
        </div>
      </div>

      {/* Description */}
      <div className="zd-panel">
        <h2 className="zd-panel-title">Zone Description</h2>
        <p className="zd-description">{zone.desc}</p>
      </div>

      {/* Sensor Data & Charts */}
      <div className="zd-charts-container">
        {/* Tabs */}
        <div className="zd-metric-tabs">
          <button
            className={`zd-tab ${selectedMetric === "rainfall" ? "active" : ""}`}
            onClick={() => setSelectedMetric("rainfall")}
          >
            Rainfall Trend
          </button>
          <button
            className={`zd-tab ${selectedMetric === "river" ? "active" : ""}`}
            onClick={() => setSelectedMetric("river")}
          >
            River Level
          </button>
          <button
            className={`zd-tab ${selectedMetric === "model" ? "active" : ""}`}
            onClick={() => setSelectedMetric("model")}
          >
            ML Accuracy
          </button>
        </div>

        {/* Chart Display */}
        <div className="zd-panel">
          {selectedMetric === "rainfall" && (
            <>
              <h3 className="zd-panel-title">Weekly Rainfall Distribution</h3>
              <BarChart data={RAINFALL_DATA} />
            </>
          )}
          {selectedMetric === "river" && (
            <>
              <h3 className="zd-panel-title">River Level - Last 24 Hours</h3>
              <LineChart data={RIVER_DATA} color="#3B82F6" unit="m" />
            </>
          )}
          {selectedMetric === "model" && (
            <>
              <h3 className="zd-panel-title">ML Model Accuracy - Weekly Trend</h3>
              <LineChart data={ML_HISTORY.map((h) => ({ t: h.date, v: h.acc }))} color="#10B981" unit="%" />
            </>
          )}
        </div>
      </div>

      {/* Sensor Status */}
      <div className="zd-panel">
        <h2 className="zd-panel-title">Sensor Status</h2>
        <div className="zd-sensor-grid">
          <div className="zd-sensor-item">
            <div className="zd-sensor-status online">●</div>
            <div>
              <div className="zd-sensor-name">Rainfall Gauge</div>
              <div className="zd-sensor-meta">Online · Data sync 2m ago</div>
            </div>
          </div>
          <div className="zd-sensor-item">
            <div className="zd-sensor-status online">●</div>
            <div>
              <div className="zd-sensor-name">Water Level Sensor</div>
              <div className="zd-sensor-meta">Online · Data sync 1m ago</div>
            </div>
          </div>
          <div className="zd-sensor-item">
            <div className="zd-sensor-status online">●</div>
            <div>
              <div className="zd-sensor-name">Temperature Gauge</div>
              <div className="zd-sensor-meta">Online · Data sync 3m ago</div>
            </div>
          </div>
          <div className="zd-sensor-item">
            <div className="zd-sensor-status online">●</div>
            <div>
              <div className="zd-sensor-name">Humidity Monitor</div>
              <div className="zd-sensor-meta">Online · Data sync 2m ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="zd-panel">
        <h2 className="zd-panel-title">Quick Actions</h2>
        <div className="zd-actions">
          <button className="zd-btn-primary">📊 View Full Report</button>
          <button className="zd-btn-secondary">🔔 Set Alert Rule</button>
          <button className="zd-btn-secondary">📥 Export Data</button>
          <button className="zd-btn-secondary">🗺️ View on Map</button>
        </div>
      </div>
    </div>
  );
}
