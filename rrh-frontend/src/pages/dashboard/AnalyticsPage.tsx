import { useState, useCallback, Fragment } from "react";
import { apiService } from "../../services/api";
import { useZones, useIsAdmin, useSubscriptions, useAvgRainfall } from "../../hooks/useData";
import { LEVEL_COLORS } from "../../constants";
import { formatDateTime } from "../../utils/helpers";

interface SensorReading {
  id: string;
  region_id: string;
  source: string;
  rainfall_mm: number | null;
  temperature_c: number | null;
  humidity_pct: number | null;
  wind_speed_ms: number | null;
  river_level_m: number | null;
  soil_moisture_pct: number | null;
  recorded_at: string;
}

interface PredictResult {
  zone_id: string;
  risk_level: string;
  confidence: number;
  timestamp: string;
  soil_moisture_source: string;
}

const CHIP: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: "#7f1d1d", color: "#fff" },
  HIGH:     { bg: "#7c2d12", color: "#fff" },
  MODERATE: { bg: "#713f12", color: "#fff" },
  LOW:      { bg: "#14532d", color: "#fff" },
};

export default function AnalyticsPage() {
  const { zones } = useZones();
  const { isAdmin } = useIsAdmin();
  const { data: subscriptions, refresh: refreshSubs } = useSubscriptions();
  const { avgRainfall, loading: rainfallLoading } = useAvgRainfall();

  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [latestReadings, setLatestReadings] = useState<Record<string, SensorReading | null>>({});
  const [iotReadings, setIotReadings]   = useState<Record<string, SensorReading | null>>({});
  const [readingLoading, setReadingLoading] = useState<Record<string, boolean>>({});
  const [predictResults, setPredictResults] = useState<Record<string, PredictResult>>({});
  const [predLoading, setPredLoading]   = useState<Record<string, boolean>>({});
  const [subLoading, setSubLoading]     = useState<Record<string, boolean>>({});

  const criticalCount = zones.filter((z) => z.level === "CRITICAL").length;
  const subscribedIds = new Set(subscriptions?.map((s) => s.region_id) ?? []);

  const handleExpand = useCallback((regionId: string) => {
    setExpandedId((prev) => (prev === regionId ? null : regionId));
    if (!(regionId in latestReadings) && !readingLoading[regionId]) {
      const zone = zones.find((z) => z.regionId === regionId);
      const isSebeya = zone?.name.toLowerCase().includes("sebeya") ?? false;

      setReadingLoading((prev) => ({ ...prev, [regionId]: true }));

      const generalFetch = apiService
        .getRegionSensorReadingLatest(regionId)
        .then((r) => setLatestReadings((prev) => ({ ...prev, [regionId]: r as SensorReading })))
        .catch(() => setLatestReadings((prev) => ({ ...prev, [regionId]: null })));

      const iotFetch = isSebeya
        ? apiService
            .getRegionSensorReadingLatest(regionId, "iot_real")
            .then((r) => setIotReadings((prev) => ({ ...prev, [regionId]: r as SensorReading })))
            .catch(() => setIotReadings((prev) => ({ ...prev, [regionId]: null })))
        : Promise.resolve();

      Promise.allSettled([generalFetch, iotFetch]).finally(() =>
        setReadingLoading((prev) => ({ ...prev, [regionId]: false }))
      );
    }
  }, [latestReadings, readingLoading, zones]);

  const handlePredict = useCallback(async (regionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPredLoading((prev) => ({ ...prev, [regionId]: true }));
    try {
      const result = await apiService.getPrediction(regionId);
      setPredictResults((prev) => ({ ...prev, [regionId]: result as unknown as PredictResult }));
    } catch { /* keep previous */ } finally {
      setPredLoading((prev) => ({ ...prev, [regionId]: false }));
    }
  }, []);

  const handleSubscribe = useCallback(async (regionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubLoading((prev) => ({ ...prev, [regionId]: true }));
    try {
      if (subscribedIds.has(regionId)) {
        await apiService.unsubscribe(regionId);
      } else {
        await apiService.subscribe(regionId);
      }
      refreshSubs?.();
    } catch { /* ignore */ } finally {
      setSubLoading((prev) => ({ ...prev, [regionId]: false }));
    }
  }, [subscribedIds, refreshSubs]);

  return (
    <div className="db-overview-page">

      {/* ── Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="db-panel">
          <div className="db-panel-body" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
              🔴 Critical Zones
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: criticalCount > 0 ? "#ef4444" : "#6ee7b7" }}>
              {zones.length ? criticalCount : "—"}
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              Out of {zones.length} monitored regions
            </div>
          </div>
        </div>

        <div className="db-panel">
          <div className="db-panel-body" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
              🌧️ Avg Rainfall · 7-day
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#3b82f6" }}>
              {rainfallLoading ? "…" : avgRainfall !== null ? `${avgRainfall}mm` : "—"}
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              NASA POWER · all regions
            </div>
          </div>
        </div>
      </div>

      {/* ── Regions table ─────────────────────────────────────────────── */}
      <div className="db-panel">
        <div className="db-panel-header">
          <div>
            <h3 className="db-panel-title">📍 Region Flood Predictions</h3>
            <p className="db-panel-subtitle">{zones.length} monitored zones · click a row to expand</p>
          </div>
        </div>
        <div className="db-panel-body">
          <table className="db-zone-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Risk Level</th>
                <th>ML Score</th>
                <th>Last Predicted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const isExpanded   = expandedId === zone.regionId;
                const prediction   = predictResults[zone.regionId];
                const freshLevel   = prediction?.risk_level?.toUpperCase() ?? zone.level;
                const freshScore   = prediction ? Math.round(prediction.confidence * 100) : zone.score;
                const chip         = CHIP[freshLevel] ?? CHIP.LOW;
                const reading      = latestReadings[zone.regionId];
                const iotReading   = iotReadings[zone.regionId];
                const soilMoisture = iotReading?.soil_moisture_pct ?? reading?.soil_moisture_pct ?? null;
                const soilIsLive   = iotReading?.soil_moisture_pct != null;
                const isSubscribed = subscribedIds.has(zone.regionId);

                return (
                  <Fragment key={zone.regionId}>
                    <tr style={{ cursor: "pointer" }} onClick={() => handleExpand(zone.regionId)}>
                      <td className="db-zone-name">{zone.name}</td>
                      <td>
                        <span className="db-risk-badge" style={{ background: LEVEL_COLORS[freshLevel] }}>
                          {freshLevel}
                        </span>
                      </td>
                      <td className="db-mono">{freshScore}%</td>
                      <td className="db-time">{formatDateTime(zone.updated, "default")}</td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 10 }}>
                        {isExpanded ? "▲" : "▼"}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={5} style={{ padding: 0 }}>
                          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(173, 173, 173, 0.24)" }}>

                            {/* Header + action buttons */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                              <div>
                                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700 }}>{zone.name}</p>
                                <span className="zd-mini-chip" style={{ background: chip.bg, color: chip.color }}>
                                  {zone.level}
                                </span>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                {isAdmin && (
                                  <button
                                    className="db-btn-sm2"
                                    onClick={(e) => handlePredict(zone.regionId, e)}
                                    disabled={predLoading[zone.regionId]}
                                  >
                                    {predLoading[zone.regionId] ? "Running…" : " Predict"}
                                  </button>
                                )}
                                {!isAdmin && (
                                  <button
                                    className="db-btn-sm2"
                                    onClick={(e) => handleSubscribe(zone.regionId, e)}
                                    disabled={subLoading[zone.regionId]}
                                    style={isSubscribed ? { borderColor: "#ef4444", color: "#ef4444" } : {}}
                                  >
                                    {subLoading[zone.regionId] ? "…" : isSubscribed ? "Unsubscribe" : "Subscribe"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            {zone.desc && (
                              <p style={{ fontSize: 14, color: "rgba(8, 8, 8, 0.5)", lineHeight: 1.6, margin: "0 0 12px" }}>
                                {zone.desc}
                              </p>
                            )}

                            {/* Latest sensor reading */}
                            <div className="zd-mini-metrics">
                              {readingLoading[zone.regionId] ? (
                                <div style={{ fontSize: 11, color: "rgba(8, 8, 8, 0.5)", padding: "4px 0" }}>
                                  Loading sensor data…
                                </div>
                              ) : reading ? (
                                <>
                                  {reading.temperature_c !== null && (
                                    <div className="zd-mini-metric2">
                                      <div className="zd-mini-metric-lbl2">Temperature</div>
                                      <div className="zd-mini-metric-val2">{reading.temperature_c.toFixed(1)}°C</div>
                                    </div>
                                  )}
                                  {reading.humidity_pct !== null && (
                                    <div className="zd-mini-metric2">
                                      <div className="zd-mini-metric-lbl2">Humidity</div>
                                      <div className="zd-mini-metric-val2">{reading.humidity_pct.toFixed(1)}%</div>
                                    </div>
                                  )}
                                  {soilMoisture !== null && (
                                    <div className="zd-mini-metric2">
                                      <div className="zd-mini-metric-lbl2">
                                        Soil Moisture
                                        {soilIsLive && (
                                          <span style={{ marginLeft: 4, fontSize: 9, fontFamily: "var(--mono)", padding: "1px 4px", borderRadius: 3, background: "#d1fae5", color: "#065f46" }}>
                                            ● Live
                                          </span>
                                        )}
                                      </div>
                                      <div className="zd-mini-metric-val2">{soilMoisture.toFixed(1)}%</div>
                                    </div>
                                  )}
                                  {reading.rainfall_mm !== null && (
                                    <div className="zd-mini-metric2">
                                      <div className="zd-mini-metric-lbl2">Rainfall</div>
                                      <div className="zd-mini-metric-val2">{reading.rainfall_mm.toFixed(2)}mm</div>
                                    </div>
                                  )}
                                </>
                              ) : reading === null ? (
                                <div style={{ fontSize: 11, color: "rgba(8, 8, 8, 0.5)", padding: "4px 0" }}>
                                  No sensor data available
                                </div>
                              ) : null}
                            </div>

                            {/* Prediction result */}
                            {prediction && (
                              <div style={{ paddingTop: 10, marginTop: 10, borderTop: "1px solid rgba(173, 173, 173, 0.24)" }}>
                                <div style={{ fontSize: 12, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                                  Latest Prediction
                                </div>
                                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                  <span className="db-risk-badge" style={{ background: LEVEL_COLORS[prediction.risk_level?.toUpperCase()] }}>
                                    {prediction.risk_level?.toUpperCase()}
                                  </span>
                                  <span style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                                    Confidence: {Math.round(prediction.confidence * 100)}%
                                  </span>
                                  {prediction.soil_moisture_source === "iot_real" && (
                                    <span style={{ fontSize: 11, fontFamily: "var(--mono)", padding: "2px 6px", borderRadius: 3, background: "#14532d", color: "#6ee7b7" }}>
                                      ● Live Sensor
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, fontFamily: "var(--mono)", marginTop: 4 }}>
                                  {formatDateTime(prediction.timestamp, "default")}
                                </div>
                              </div>
                            )}

                            {/* Coordinates */}
                            <div style={{ fontSize: 12, fontFamily: "var(--mono)", marginTop: 12, textAlign: "right" }}>
                              {zone.lat.toFixed(4)}°N · {zone.lng.toFixed(4)}°E
                            </div>
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

    </div>
  );
}
