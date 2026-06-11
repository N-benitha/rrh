import React, { useState } from 'react';

interface ThresholdSettings {
  rainfall: number;   // mm/h
  riverLevel: number; // metres
  riskScore: number;  // %
}

const DEFAULTS: ThresholdSettings = { rainfall: 70, riverLevel: 2.5, riskScore: 80 };

export const ThresholdsPage: React.FC = () => {
  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem("rrh_thresholds");
      return saved ? JSON.parse(saved) : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  const set = (key: keyof ThresholdSettings, value: number) =>
    setThresholds(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem("rrh_thresholds", JSON.stringify(thresholds));
    alert("Thresholds saved successfully!");
  };

  return (
    <div className="thresh-container">
      <div className="thresh-header">
        <h2>⚠️ Alert Thresholds — Sebeya River Basin</h2>
        <p>Configure trigger levels for automated flood alerts across SEBY-DS-03 · SEBY-MS-02 · SEBY-US-01</p>
      </div>

      <div className="thresh-card">
        {/* Rainfall */}
        <div className="thresh-item">
          <div className="thresh-label">
            <label>Rainfall Alert Trigger</label>
            <span className="thresh-value">{thresholds.rainfall} mm/h</span>
          </div>
          <input
            type="range" min="30" max="120" step="5"
            value={thresholds.rainfall}
            onChange={(e) => set("rainfall", Number(e.target.value))}
            className="thresh-slider"
          />
          <div className="thresh-range">
            <span>30 mm/h</span>
            <span style={{ color: "#EAB308" }}>50 mm/h (High)</span>
            <span style={{ color: "#DC2626" }}>70 mm/h (Critical)</span>
            <span>120 mm/h</span>
          </div>
          <p className="thresh-desc">
            Sebeya critical threshold: <strong>70 mm/h</strong>. Alert triggers when hourly rainfall exceeds this level at any sensor station.
          </p>
        </div>

        {/* River Level */}
        <div className="thresh-item">
          <div className="thresh-label">
            <label>River Level Alert Trigger</label>
            <span className="thresh-value">{thresholds.riverLevel.toFixed(1)} m</span>
          </div>
          <input
            type="range" min="1.0" max="4.0" step="0.1"
            value={thresholds.riverLevel}
            onChange={(e) => set("riverLevel", Number(e.target.value))}
            className="thresh-slider"
          />
          <div className="thresh-range">
            <span>1.0 m</span>
            <span style={{ color: "#EAB308" }}>2.0 m (High)</span>
            <span style={{ color: "#DC2626" }}>2.5 m (Critical)</span>
            <span>4.0 m</span>
          </div>
          <p className="thresh-desc">
            Sebeya critical threshold: <strong>2.5 m</strong> at SEBY-DS-03 (Kanama downstream). Evacuation required above this level.
          </p>
        </div>

        {/* ML Risk Score */}
        <div className="thresh-item">
          <div className="thresh-label">
            <label>ML Risk Score Alert Trigger</label>
            <span className="thresh-value">{thresholds.riskScore}%</span>
          </div>
          <input
            type="range" min="50" max="100" step="5"
            value={thresholds.riskScore}
            onChange={(e) => set("riskScore", Number(e.target.value))}
            className="thresh-slider"
          />
          <div className="thresh-range">
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="thresh-desc">
            Random Forest model (91.4% accuracy). Alert when flood probability exceeds this score.
          </p>
        </div>
      </div>

      <div className="thresh-presets">
        <h3>🎯 Quick Presets</h3>
        <div className="thresh-preset-buttons">
          <button className="preset-btn" onClick={() => setThresholds({ rainfall: 50, riverLevel: 2.0, riskScore: 60 })}>
            🎯 Sensitive — Early Warning
          </button>
          <button className="preset-btn" onClick={() => setThresholds(DEFAULTS)}>
            ⚖️ Standard — Sebeya Thresholds
          </button>
          <button className="preset-btn" onClick={() => setThresholds({ rainfall: 90, riverLevel: 3.0, riskScore: 90 })}>
            😌 Relaxed — Critical Only
          </button>
        </div>
      </div>

      <div className="thresh-actions">
        <button className="thresh-btn-reset" onClick={() => setThresholds(DEFAULTS)}>
          Reset to Sebeya Defaults
        </button>
        <button className="thresh-btn-save" onClick={handleSave}>
          Save Thresholds
        </button>
      </div>
    </div>
  );
};
