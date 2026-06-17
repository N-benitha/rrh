import React, { useState } from 'react';

interface ThresholdSettings {
  rainfall: number;
  riverLevel: number;
  riskScore: number;
}

export const ThresholdsPage: React.FC = () => {
  const [thresholds, setThresholds] = useState<ThresholdSettings>({
    rainfall: 45,
    riverLevel: 60,
    riskScore: 70,
  });

  const handleSliderChange = (key: keyof ThresholdSettings, value: number) => {
    setThresholds(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setThresholds({
      rainfall: 45,
      riverLevel: 60,
      riskScore: 70,
    });
  };

  const handleSave = () => {
    localStorage.setItem('thresholds', JSON.stringify(thresholds));
    alert('Thresholds saved successfully!');
  };

  return (
    <div className="thresh-container">
      <div className="thresh-header">
        <h2>⚠️ Alert Thresholds</h2>
        <p>Set sensitivity levels for automated alerts</p>
      </div>

      <div className="thresh-card">
        <div className="thresh-item">
          <div className="thresh-label">
            <label>Rainfall Alert Trigger</label>
            <span className="thresh-value">{thresholds.rainfall} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={thresholds.rainfall}
            onChange={(e) => handleSliderChange('rainfall', Number(e.target.value))}
            className="thresh-slider"
          />
          <div className="thresh-range">
            <span>0 mm</span>
            <span>100 mm</span>
          </div>
          <p className="thresh-desc">Alert triggers when rainfall exceeds this level</p>
        </div>

        <div className="thresh-item">
          <div className="thresh-label">
            <label>River Level Alert Trigger</label>
            <span className="thresh-value">{thresholds.riverLevel} cm</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            value={thresholds.riverLevel}
            onChange={(e) => handleSliderChange('riverLevel', Number(e.target.value))}
            className="thresh-slider"
          />
          <div className="thresh-range">
            <span>0 cm</span>
            <span>150 cm</span>
          </div>
          <p className="thresh-desc">Alert triggers when water level rises above this point</p>
        </div>

        <div className="thresh-item">
          <div className="thresh-label">
            <label>Risk Score Alert Trigger</label>
            <span className="thresh-value">{thresholds.riskScore}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={thresholds.riskScore}
            onChange={(e) => handleSliderChange('riskScore', Number(e.target.value))}
            className="thresh-slider"
          />
          <div className="thresh-range">
            <span>0%</span>
            <span>100%</span>
          </div>
          <p className="thresh-desc">Alert triggers when risk score exceeds this percentage</p>
        </div>
      </div>

      <div className="thresh-presets">
        <h3>🎯 Quick Presets</h3>
        <div className="thresh-preset-buttons">
          <button
            className="preset-btn"
            onClick={() => setThresholds({ rainfall: 30, riverLevel: 45, riskScore: 50 })}
          >
            🎯 Sensitive
          </button>
          <button
            className="preset-btn"
            onClick={() => setThresholds({ rainfall: 50, riverLevel: 70, riskScore: 75 })}
          >
            ⚖️ Moderate
          </button>
          <button
            className="preset-btn"
            onClick={() => setThresholds({ rainfall: 80, riverLevel: 100, riskScore: 90 })}
          >
            😌 Relaxed
          </button>
        </div>
      </div>

      <div className="thresh-actions">
        <button className="thresh-btn-reset" onClick={handleReset}>
          Reset to Default
        </button>
        <button className="thresh-btn-save" onClick={handleSave}>
          Save Thresholds
        </button>
      </div>
    </div>
  );
};
