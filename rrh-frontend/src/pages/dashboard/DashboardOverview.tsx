import { useState, useEffect } from "react";
import DashMap from "../../components/dashboard/DashMap";
import { LineChart } from "../../components/dashboard/Charts";
import StatCards from "../../components/dashboard/StatCards";
import AlertsList from "../../components/dashboard/AlertsList";
import { useDashboardStats, useZones, useAlerts, useIsAdmin, useSubscriptions, useRegionDetail, useRainfallData } from "../../hooks/useData";
import { LEVEL_COLORS } from "../../constants";
import type { Alert, StatCardItem } from "../../types";

const CHIP: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: "#7f1d1d", color: "#fca5a5" },
  HIGH:     { bg: "#7c2d12", color: "#fdba74" },
  MODERATE: { bg: "#713f12", color: "#fde68a" },
  LOW:      { bg: "#14532d", color: "#6ee7b7" },
};

export const RISK_LABEL: Record<string, string> = {
  critical: "CRITICAL", high: "HIGH", moderate: "MODERATE", medium: "MEDIUM", low: "LOW",
};

export default function DashboardOverview() {
  const { data: stats } = useDashboardStats();
  const { zones, loading: zonesLoading } = useZones();
  const { alerts } = useAlerts();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { data: subscriptions } = useSubscriptions();
  const firstRegionId = subscriptions?.[0]?.region_id ?? null;
  const { data: regionDetail } = useRegionDetail(firstRegionId);

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const { data: selectedRegion, loading: selectedRegionLoading } = useRegionDetail(selectedRegionId);
  const [adminRainfallRegionId, setAdminRainfallRegionId] = useState<string | null>(null);
  const rainfallRegionId = roleLoading || zonesLoading ? null : isAdmin
    ? (adminRainfallRegionId ?? zones[0]?.regionId ?? null)
    : firstRegionId;
  const { data: rainfallData, loading: rainfallLoading, noSubscription } = useRainfallData(rainfallRegionId);

  const adminStatCards: StatCardItem[] = [
    {
      label: "Active Alerts",
      value: stats ? String(stats.alerts_by_status?.pending ?? stats.total_alerts) : "—",
      change: "Pending alerts",
      trend: "up",
      type: "alert",
    },
    {
      label: "Critical Zones",
      value: stats ? String(stats.predictions_by_risk_level?.critical ?? 0) : "—",
      change: "Critical predictions",
      trend: "stable",
      type: "zone",
    },
    {
      label: "Total Predictions",
      value: stats ? String(stats.total_predictions) : "—",
      change: "ML predictions run",
      trend: "up",
      type: "accuracy",
    },
    {
      label: "Monitored Regions",
      value: stats ? String(stats.regions_count) : "—",
      change: "Across Rwanda",
      trend: "stable",
      type: "rainfall",
    },
  ];

  const pred = regionDetail?.latest_prediction ?? null;
  const userStatCards: StatCardItem[] = [
    {
      label: "Active Alerts",
      value: String(alerts.length),
      change: "Your pending alerts",
      trend: "up",
      type: "alert",
    },
    {
      label: "My Region Risk",
      value: pred ? (RISK_LABEL[pred.risk_level.toLowerCase()] ?? pred.risk_level.toUpperCase()) : "—",
      change: regionDetail?.name ?? (firstRegionId ? "Loading…" : "Subscribe to a region"),
      trend: "stable",
      type: "zone",
    },
    {
      label: "Prediction Confidence",
      value: pred ? `${Math.round(pred.confidence_score * 100)}%` : "—",
      change: pred ? `Model ${pred.model_version}` : "No prediction yet",
      trend: "up",
      type: "accuracy",
    },
    {
      label: "My Subscriptions",
      value: subscriptions ? String(subscriptions.length) : "—",
      change: "Subscribed regions",
      trend: "stable",
      type: "rainfall",
    },
  ];

  const statCards = roleLoading ? [] : isAdmin ? adminStatCards : userStatCards;

  const handleAlertClick = (alert: Alert) => {
    setSelectedRegionId((prev) => (prev === alert.region_id ? null : alert.region_id));
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
                <DashMap zones={zones} />
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
              alerts={alerts}
              limit={4}
              onAlertClick={handleAlertClick}
            />

            {selectedRegionId && (() => {
              if (selectedRegionLoading) return (
                <div className="zd-mini-card" style={{ textAlign: "center", color: "rgba(255,255,255,.5)", padding: "24px" }}>
                  Loading region…
                </div>
              );
              if (!selectedRegion) return null;
              const riskLevel = selectedRegion.risk_level?.toUpperCase() ?? "LOW";
              const chip = CHIP[riskLevel] ?? CHIP.LOW;
              const rCol = LEVEL_COLORS[riskLevel as keyof typeof LEVEL_COLORS] ?? "#22c55e";
              const pred = selectedRegion.latest_prediction;
              const confidence = pred ? Math.round(pred.confidence_score * 100) : null;
              return (
                <div className="zd-mini-card">
                  <div className="zd-mini-head">
                    <div>
                      <p className="zd-mini-name">{selectedRegion.name}</p>
                      <span className="zd-mini-chip" style={{ background: chip.bg, color: chip.color }}>
                        {riskLevel}
                      </span>
                    </div>
                    <button className="zd-mini-close" onClick={() => setSelectedRegionId(null)}>×</button>
                  </div>

                  {confidence !== null && (
                    <div className="zd-mini-score-wrap">
                      <div className="zd-mini-score-row">
                        <span className="zd-mini-score-lbl">ML Confidence</span>
                        <span className="zd-mini-score-val">{confidence}%</span>
                      </div>
                      <div className="zd-mini-score-track">
                        <div className="zd-mini-score-fill" style={{ width: `${confidence}%`, background: rCol }} />
                      </div>
                    </div>
                  )}

                  {selectedRegion.description && (
                    <div className="zd-mini-desc">{selectedRegion.description}</div>
                  )}
                  {pred && (
                    <div className="zd-mini-updated">
                      Last predicted: {new Date(pred.predicted_at).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <div>
            <h3 className="db-panel-title">🌧️ Weekly Rainfall Trend</h3>
            <p className="db-panel-subtitle">7-day NASA POWER rainfall · mm/day</p>
          </div>
          {isAdmin && zones.length > 0 && (
            <select
              className="db-region-select"
              value={adminRainfallRegionId ?? zones[0]?.regionId ?? ""}
              onChange={(e) => setAdminRainfallRegionId(e.target.value)}
            >
              {zones.map((z) => (
                <option key={z.regionId} value={z.regionId}>{z.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="db-panel-body">
          {noSubscription ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              No region subscription. Subscribe to a region to see rainfall data.
            </div>
          ) : rainfallLoading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              Loading rainfall data…
            </div>
          ) : rainfallData.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              No rainfall data available for this region yet.
            </div>
          ) : (
            <LineChart data={rainfallData.map((d) => ({ t: d.day, v: d.mm }))} color="#3b82f6" unit="mm" title="Rainfall (mm)" height={150} />
          )}
        </div>
      </div>
    </div>
  );
}
