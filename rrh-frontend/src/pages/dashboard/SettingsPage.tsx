import { useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    inAppNotifs: true,
    dailyDigest: true,
    criticalOnly: false,
  });

  const [thresholds, setThresholds] = useState({
    rainfall: 70,
    riverLevel: 2.5,
    riskScore: 80,
  });

  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="db-settings">
      {/* Success Message */}
      {saved && (
        <div className="set-success-banner">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Notification Preferences */}
      <div className="set-panel">
        <h2 className="set-panel-title">🔔 Notification Preferences</h2>

        <div className="set-toggle-group">
          <div className="set-toggle-item">
            <div>
              <div className="set-toggle-label">📧 Email Alerts</div>
              <div className="set-toggle-desc">Receive alerts via email</div>
            </div>
            <label className="set-toggle">
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, emailAlerts: e.target.checked })
                }
              />
              <span className="set-toggle-slider"></span>
            </label>
          </div>

          <div className="set-toggle-item">
            <div>
              <div className="set-toggle-label">📱 Mobile Push Notifications</div>
              <div className="set-toggle-desc">Receive alerts on the RRH mobile app (Expo)</div>
            </div>
            <label className="set-toggle">
              <input
                type="checkbox"
                checked={notifications.smsAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, smsAlerts: e.target.checked })
                }
              />
              <span className="set-toggle-slider"></span>
            </label>
          </div>

          <div className="set-toggle-item">
            <div>
              <div className="set-toggle-label">🔔 In-App Notifications</div>
              <div className="set-toggle-desc">Show notifications in dashboard</div>
            </div>
            <label className="set-toggle">
              <input
                type="checkbox"
                checked={notifications.inAppNotifs}
                onChange={(e) =>
                  setNotifications({ ...notifications, inAppNotifs: e.target.checked })
                }
              />
              <span className="set-toggle-slider"></span>
            </label>
          </div>

          <div className="set-toggle-item">
            <div>
              <div className="set-toggle-label">📰 Daily Digest</div>
              <div className="set-toggle-desc">Summary of daily metrics</div>
            </div>
            <label className="set-toggle">
              <input
                type="checkbox"
                checked={notifications.dailyDigest}
                onChange={(e) =>
                  setNotifications({ ...notifications, dailyDigest: e.target.checked })
                }
              />
              <span className="set-toggle-slider"></span>
            </label>
          </div>

          <div className="set-toggle-item">
            <div>
              <div className="set-toggle-label">🚨 Critical Alerts Only</div>
              <div className="set-toggle-desc">Only notify for critical issues</div>
            </div>
            <label className="set-toggle">
              <input
                type="checkbox"
                checked={notifications.criticalOnly}
                onChange={(e) =>
                  setNotifications({ ...notifications, criticalOnly: e.target.checked })
                }
              />
              <span className="set-toggle-slider"></span>
            </label>
          </div>
        </div>

        <button className="set-btn-primary" onClick={handleSaveSettings}>
          💾 Save Preferences
        </button>
      </div>

      {/* Alert Thresholds */}
      <div className="set-panel">
        <h2 className="set-panel-title">⚠️ Alert Thresholds</h2>
        <p className="set-panel-desc">Customize when alerts trigger for your zones</p>

        <div className="set-form-row">
          <div className="set-form-group">
            <label>Rainfall Alert (mm/h) — Critical threshold: 70 mm/h</label>
            <div className="set-input-group">
              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={thresholds.rainfall}
                onChange={(e) =>
                  setThresholds({ ...thresholds, rainfall: parseInt(e.target.value) })
                }
              />
              <span className="set-input-value">{thresholds.rainfall} mm/h</span>
            </div>
            <div className="set-input-hint">Alert when hourly rainfall exceeds this value at Sebeya sensors</div>
          </div>

          <div className="set-form-group">
            <label>River Level Alert (m) — Critical threshold: 2.5 m</label>
            <div className="set-input-group">
              <input
                type="range"
                min="1"
                max="4"
                step="0.1"
                value={thresholds.riverLevel}
                onChange={(e) =>
                  setThresholds({ ...thresholds, riverLevel: parseFloat(e.target.value) })
                }
              />
              <span className="set-input-value">{thresholds.riverLevel.toFixed(1)} m</span>
            </div>
            <div className="set-input-hint">Alert when Sebeya River level exceeds this height at SEBY-DS-03</div>
          </div>

          <div className="set-form-group">
            <label>Risk Score Alert (%)</label>
            <div className="set-input-group">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={thresholds.riskScore}
                onChange={(e) =>
                  setThresholds({ ...thresholds, riskScore: parseInt(e.target.value) })
                }
              />
              <span className="set-input-value">{thresholds.riskScore}%</span>
            </div>
            <div className="set-input-hint">Alert when risk score exceeds this threshold</div>
          </div>
        </div>

        <button className="set-btn-primary" onClick={handleSaveSettings}>
          💾 Save Thresholds
        </button>
      </div>

      {/* Theme & Appearance */}
      <div className="set-panel">
        <h2 className="set-panel-title">🎨 Theme & Appearance</h2>

        <div className="set-theme-grid">
          <button
            className={`set-theme-btn ${theme === "light" ? "active" : ""}`}
            onClick={() => setTheme("light")}
          >
            <div className="set-theme-preview light"></div>
            <div className="set-theme-name">☀️ Light Mode</div>
            <div className="set-theme-desc">Light background with dark text</div>
          </button>

          <button
            className={`set-theme-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => setTheme("dark")}
          >
            <div className="set-theme-preview dark"></div>
            <div className="set-theme-name">🌙 Dark Mode</div>
            <div className="set-theme-desc">Dark background with light text</div>
          </button>
        </div>

        <button className="set-btn-primary" onClick={handleSaveSettings}>
          🎨 Apply Theme
        </button>
      </div>

      {/* Data & Privacy */}
      <div className="set-panel">
        <h2 className="set-panel-title">📊 Data & Privacy</h2>

        <div className="set-info-box">
          <div className="set-info-title">System Information</div>
          <div className="set-info-row">
            <span>Monitoring Area:</span>
            <strong>Sebeya River Basin · Rubavu District</strong>
          </div>
          <div className="set-info-row">
            <span>Active Sensors:</span>
            <strong>3 stations (SEBY-DS-03, SEBY-MS-02, SEBY-US-01)</strong>
          </div>
          <div className="set-info-row">
            <span>Last Login:</span>
            <strong>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
          </div>
          <div className="set-info-row">
            <span>Data Source:</span>
            <strong>OpenWeather API · IoT Sensors</strong>
          </div>
        </div>

        <div className="set-button-group">
          <button className="set-btn-secondary">📥 Download My Data</button>
          <button className="set-btn-danger">🗑️ Delete Account</button>
        </div>
      </div>
    </div>
  );
}
