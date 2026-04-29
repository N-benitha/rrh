import { useState } from "react";
import { ALERTS } from "../../constants";

type AlertWithId = typeof ALERTS[number] & { id: number };
type RuleEntry = { condition: string; notify: string; message: string };

export default function AlertsManagementPage() {
  const [alerts, setAlerts] = useState<AlertWithId[]>(() =>
    ALERTS.map((a, i) => ({ ...a, id: i }))
  );
  const [filterLevel, setFilterLevel] = useState("all");
  const [viewedId, setViewedId] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState<RuleEntry>({
    condition: "Rainfall > 100mm/day",
    notify: "All Users",
    message: "",
  });
  const [rules, setRules] = useState<RuleEntry[]>([]);
  const [ruleSuccess, setRuleSuccess] = useState(false);

  const filtered = filterLevel === "all" ? alerts : alerts.filter((a) => a.lvl === filterLevel);

  const COLORS: Record<string, string> = {
    crit: "#DC2626", high: "#F97316", mod: "#EAB308", low: "#059669",
  };
  const LABELS: Record<string, string> = {
    crit: "Critical", high: "High", mod: "Moderate", low: "Low",
  };

  const dismiss = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (viewedId === id) setViewedId(null);
  };

  const createRule = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!ruleForm.message.trim()) return;
    setRules((prev) => [...prev, { ...ruleForm }]);
    setRuleForm((f) => ({ ...f, message: "" }));
    setRuleSuccess(true);
    setTimeout(() => setRuleSuccess(false), 3000);
  };

  return (
    <div className="db-alerts-mgmt">
      {/* Stats */}
      <div className="am-stats">
        <div className="am-stat-item">
          <div className="am-stat-val">{alerts.length}</div>
          <div className="am-stat-lbl">🔔 Total Alerts</div>
        </div>
        <div className="am-stat-item">
          <div className="am-stat-val" style={{ color: "#DC2626" }}>
            {alerts.filter((a) => a.lvl === "crit").length}
          </div>
          <div className="am-stat-lbl">🔴 Critical</div>
        </div>
        <div className="am-stat-item">
          <div className="am-stat-val" style={{ color: "#F97316" }}>
            {alerts.filter((a) => a.lvl === "high").length}
          </div>
          <div className="am-stat-lbl">🟠 High</div>
        </div>
        <div className="am-stat-item">
          <div className="am-stat-val" style={{ color: "#EAB308" }}>
            {alerts.filter((a) => a.lvl === "mod").length}
          </div>
          <div className="am-stat-lbl">🟡 Moderate</div>
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
        {Object.entries(LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`am-filter-btn ${filterLevel === key ? "active" : ""}`}
            onClick={() => setFilterLevel(key)}
            style={filterLevel === key ? { borderColor: COLORS[key], color: COLORS[key] } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="am-list">
        {filtered.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#999", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            No alerts at this level.
          </div>
        ) : (
          filtered.map((alert) => (
            <div key={alert.id}>
              <div className={`am-alert-item${viewedId === alert.id ? " am-alert-open" : ""}`}>
                <div className="am-alert-left">
                  <div
                    className="am-alert-indicator"
                    style={{ background: COLORS[alert.lvl], borderColor: COLORS[alert.lvl] }}
                  />
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
                  <button
                    className="am-btn-small"
                    onClick={() => setViewedId((prev) => (prev === alert.id ? null : alert.id))}
                  >
                    {viewedId === alert.id ? "Hide" : "View"}
                  </button>
                  <button
                    className="am-btn-small am-btn-dismiss"
                    onClick={() => dismiss(alert.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              {viewedId === alert.id && (
                <div className="am-alert-detail">
                  <div className="am-detail-row">
                    <span className="am-detail-lbl">Level</span>
                    <span className="am-detail-val" style={{ color: COLORS[alert.lvl], fontWeight: 700 }}>
                      {LABELS[alert.lvl]}
                    </span>
                  </div>
                  <div className="am-detail-row">
                    <span className="am-detail-lbl">Zone</span>
                    <span className="am-detail-val">{alert.zone}</span>
                  </div>
                  <div className="am-detail-row">
                    <span className="am-detail-lbl">Reported</span>
                    <span className="am-detail-val">{alert.time}</span>
                  </div>
                  <div className="am-detail-row am-detail-full">
                    <span className="am-detail-lbl">Full Description</span>
                    <span className="am-detail-val">{alert.desc}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Active Rules */}
      {rules.length > 0 && (
        <div className="am-panel" style={{ marginBottom: 24 }}>
          <h2 className="am-panel-title">Active Rules ({rules.length})</h2>
          <div className="am-rules-list">
            {rules.map((rule, i) => (
              <div key={i} className="am-rule-item">
                <span className="am-rule-condition">{rule.condition}</span>
                <span className="am-rule-sep">→</span>
                <span className="am-rule-notify">{rule.notify}</span>
                {rule.message && <span className="am-rule-msg">"{rule.message}"</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Alert Rule */}
      <div className="am-panel">
        <h2 className="am-panel-title">Create New Alert Rule</h2>
        {ruleSuccess && (
          <div className="am-success-banner">✅ Alert rule created successfully!</div>
        )}
        <form className="am-form" onSubmit={createRule}>
          <div className="am-form-row">
            <div className="am-form-group">
              <label>Condition</label>
              <select
                value={ruleForm.condition}
                onChange={(e) => setRuleForm((f) => ({ ...f, condition: e.target.value }))}
              >
                <option>Rainfall &gt; 100mm/day</option>
                <option>River level &gt; 4m</option>
                <option>Risk score &gt; 80%</option>
              </select>
            </div>
            <div className="am-form-group">
              <label>Notify</label>
              <select
                value={ruleForm.notify}
                onChange={(e) => setRuleForm((f) => ({ ...f, notify: e.target.value }))}
              >
                <option>All Users</option>
                <option>Admins Only</option>
                <option>Zone Manager</option>
              </select>
            </div>
          </div>
          <div className="am-form-group">
            <label>Message</label>
            <input
              type="text"
              placeholder="Alert message..."
              value={ruleForm.message}
              onChange={(e) => setRuleForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <button type="submit" className="am-btn-submit">
            ➕ Create Alert Rule
          </button>
        </form>
      </div>
    </div>
  );
}
