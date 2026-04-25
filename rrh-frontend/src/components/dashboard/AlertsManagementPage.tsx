import { useState } from "react";
import { ALERTS } from "../../constants";

export default function AlertsManagementPage() {
  const [alerts] = useState(ALERTS);
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const filteredAlerts = filterLevel === "all" ? alerts : alerts.filter((a: any) => a.lvl === filterLevel);

  const levelColors: { [key: string]: string } = {
    crit: "#DC2626",
    high: "#F97316",
    mod: "#EAB308",
    low: "#059669",
  };

  const levelLabels: { [key: string]: string } = {
    crit: "Critical",
    high: "High",
    mod: "Moderate",
    low: "Low",
  };

  return (
    <div className="db-alerts-mgmt">
      {/* Stats */}
      <div className="am-stats">
        <div className="am-stat-item">
          <div className="am-stat-val">{alerts.length}</div>
          <div className="am-stat-lbl">Total Alerts</div>
        </div>
        <div className="am-stat-item">
          <div className="am-stat-val" style={{ color: "#DC2626" }}>
            {alerts.filter((a: any) => a.lvl === "crit").length}
          </div>
          <div className="am-stat-lbl">Critical</div>
        </div>
        <div className="am-stat-item">
          <div className="am-stat-val" style={{ color: "#F97316" }}>
            {alerts.filter((a: any) => a.lvl === "high").length}
          </div>
          <div className="am-stat-lbl">High</div>
        </div>
        <div className="am-stat-item">
          <div className="am-stat-val" style={{ color: "#EAB308" }}>
            {alerts.filter((a: any) => a.lvl === "mod").length}
          </div>
          <div className="am-stat-lbl">Moderate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="am-filters">
        <button
          className={`am-filter-btn ${filterLevel === "all" ? "active" : ""}`}
          onClick={() => setFilterLevel("all")}
        >
          All
        </button>
        {Object.entries(levelLabels).map(([key, label]) => (
          <button
            key={key}
            className={`am-filter-btn ${filterLevel === key ? "active" : ""}`}
            onClick={() => setFilterLevel(key)}
            style={filterLevel === key ? { borderColor: levelColors[key], color: levelColors[key] } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="am-list">
        {filteredAlerts.map((alert: any, i: number) => (
          <div key={i} className="am-alert-item">
            <div className="am-alert-left">
              <div
                className="am-alert-indicator"
                style={{
                  background: levelColors[alert.lvl],
                  borderColor: levelColors[alert.lvl],
                }}
              >
                {alert.icon}
              </div>
              <div className="am-alert-content">
                <h3 className="am-alert-title">{alert.title}</h3>
                <p className="am-alert-desc">{alert.desc}</p>
                <div className="am-alert-meta">
                  <span>🏘️ {alert.zone}</span>
                  <span>⏱️ {alert.time}</span>
                </div>
              </div>
            </div>
            <div className="am-alert-actions">
              <button className="am-btn-small">View</button>
              <button className="am-btn-small">Dismiss</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Alert Rule */}
      <div className="am-panel">
        <h2 className="am-panel-title">Create New Alert Rule</h2>
        <form className="am-form">
          <div className="am-form-row">
            <div className="am-form-group">
              <label>Condition</label>
              <select>
                <option>Rainfall &gt; 100mm/day</option>
                <option>River level &gt; 4m</option>
                <option>Risk score &gt; 80%</option>
              </select>
            </div>
            <div className="am-form-group">
              <label>Notify</label>
              <select>
                <option>All Users</option>
                <option>Admins Only</option>
                <option>Zone Manager</option>
              </select>
            </div>
          </div>
          <div className="am-form-group">
            <label>Message</label>
            <input type="text" placeholder="Alert message..." />
          </div>
          <button type="button" className="am-btn-submit">
            ➕ Create Alert Rule
          </button>
        </form>
      </div>
    </div>
  );
}
