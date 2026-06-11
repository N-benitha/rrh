import { useState, useEffect } from "react";
import { ALERTS } from "../../constants";
import { apiService } from "../../services/api";

interface AlertItem {
  id: number;
  lvl: "crit" | "high" | "mod" | "low";
  title: string;
  desc: string;
  zone: string;
  time: string;
  sensor?: string;
  rainfall_mm?: number;
  humidity_pct?: number;
  temperature_c?: number;
  source?: string;
}

type RuleEntry = { sensor: string; condition: string; notify: string; message: string };

const COLORS: Record<string, string> = {
  crit: "#DC2626", high: "#F97316", mod: "#EAB308", low: "#059669",
};
const LABELS: Record<string, string> = {
  crit: "Critical", high: "High", mod: "Moderate", low: "Low",
};
const LVL_TO_API: Record<string, string> = {
  crit: "critical", high: "high", mod: "moderate", low: "low",
};

function toLevel(level: string): AlertItem["lvl"] {
  if (level === "critical") return "crit";
  if (level === "high")     return "high";
  if (level === "moderate") return "mod";
  return "low";
}

const STATIC_ALERTS: AlertItem[] = ALERTS.map((a, i) => ({ ...a, id: i }));

export default function AlertsManagementPage() {
  const [alerts, setAlerts]             = useState<AlertItem[]>(STATIC_ALERTS);
  const [liveSource, setLiveSource]     = useState(false);
  const [loading, setLoading]           = useState(true);
  const [filterLevel, setFilterLevel]   = useState("all");
  const [viewedId, setViewedId]         = useState<number | null>(null);
  const [rules, setRules]               = useState<RuleEntry[]>([]);
  const [ruleSuccess, setRuleSuccess]   = useState(false);
  const [notifying, setNotifying]       = useState(false);
  const [notifyMsg, setNotifyMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [ruleForm, setRuleForm]         = useState<RuleEntry>({
    sensor:    "All Sebeya Sensors",
    condition: "River level > 2.5m (critical threshold)",
    notify:    "MINEMA / District Authority",
    message:   "",
  });
  const [msgForm, setMsgForm]           = useState({ title: "", body: "", level: "high" });
  const [msgSending, setMsgSending]     = useState(false);
  const [msgResult, setMsgResult]       = useState<{ ok: boolean; text: string } | null>(null);

  // Fetch live alerts and registered token count
  useEffect(() => {
    setLoading(true);
    apiService
      .getWeatherAlerts()
      .then((res: { alerts?: unknown[] }) => {
        const raw = res.alerts ?? [];
        if (raw.length > 0) {
          const mapped: AlertItem[] = (raw as {
            id: string; level: string; title: string; description: string;
            zone: string; time: string; rainfall_mm?: number;
            humidity_pct?: number; temperature_c?: number; source?: string;
          }[]).map((a, i) => ({
            id:            i,
            lvl:           toLevel(a.level),
            title:         a.title,
            desc:          a.description,
            zone:          a.zone,
            time:          a.time,
            sensor:        a.title.split("—")[1]?.split("·")[0]?.trim(),
            rainfall_mm:   a.rainfall_mm,
            humidity_pct:  a.humidity_pct,
            temperature_c: a.temperature_c,
            source:        a.source,
          }));
          setAlerts(mapped);
          setLiveSource(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

  }, []);

  const filtered = filterLevel === "all" ? alerts : alerts.filter((a) => a.lvl === filterLevel);

  const dismiss = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (viewedId === id) setViewedId(null);
  };

  const sendNotification = async (alert: AlertItem) => {
    setNotifying(true);
    setNotifyMsg(null);
    try {
      const res = await apiService.sendPushAlert(
        alert.title,
        alert.desc.slice(0, 120),
        LVL_TO_API[alert.lvl],
      );
      void res;
      setNotifyMsg({
        ok:   true,
        text: `✅ Alert queued , mobile app will receive it within 15 seconds`,
      });
    } catch {
      setNotifyMsg({ ok: false, text: "❌ Could not reach notification service" });
    } finally {
      setNotifying(false);
      setTimeout(() => setNotifyMsg(null), 4000);
    }
  };

  const sendCustomMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!msgForm.title.trim() || !msgForm.body.trim()) return;
    setMsgSending(true);
    setMsgResult(null);
    try {
      await apiService.sendPushAlert(msgForm.title.trim(), msgForm.body.trim(), msgForm.level);
      setMsgResult({ ok: true, text: "✅ Message sent — mobile app will receive it within 15 seconds" });
      setMsgForm({ title: "", body: "", level: "high" });
    } catch {
      setMsgResult({ ok: false, text: "❌ Could not reach notification service" });
    } finally {
      setMsgSending(false);
      setTimeout(() => setMsgResult(null), 5000);
    }
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

      {/* ── Stats ── */}
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

      {/* ── Source + token count row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4,
          background: liveSource ? "#d1fae5" : "#f3f4f6",
          color:      liveSource ? "#065f46" : "#6b7280",
          border:     `1px solid ${liveSource ? "#6ee7b7" : "#e5e7eb"}`,
        }}>
          {loading ? "Fetching…" : liveSource ? "● OpenWeather Live — Sebeya Basin" : "● Static — Sebeya Sensor Data"}
        </span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>
          Sebeya River: SEBY-DS-03 · SEBY-MS-02 · SEBY-US-01
        </span>
        <span style={{
          marginLeft: "auto", fontSize: 11, fontWeight: 600,
          padding: "3px 10px", borderRadius: 4,
          background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
        }}>
          📱 Mobile polling every 15 s
        </span>
      </div>

      {/* Notify feedback banner */}
      {notifyMsg && (
        <div style={{
          marginBottom: 12, padding: "10px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
          background: notifyMsg.ok ? "#d1fae5" : "#fef3c7",
          color:      notifyMsg.ok ? "#065f46" : "#92400e",
          border:     `1px solid ${notifyMsg.ok ? "#6ee7b7" : "#fde68a"}`,
        }}>
          {notifyMsg.text}
        </div>
      )}

      {/* ── Filters ── */}
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

      {/* ── Alerts list ── */}
      <div className="am-list">
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#999", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            No alerts at this level.
          </div>
        ) : (
          filtered.map((alert) => (
            <div key={alert.id}>
              <div className={`am-alert-item${viewedId === alert.id ? " am-alert-open" : ""}`}>
                <div className="am-alert-left">
                  <div className="am-alert-indicator" style={{ background: COLORS[alert.lvl], borderColor: COLORS[alert.lvl] }} />
                  <div className="am-alert-content">
                    <h3 className="am-alert-title">{alert.title}</h3>
                    <p className="am-alert-desc">{alert.desc}</p>
                    <div className="am-alert-meta">
                      <span>📍 {alert.zone}</span>
                      <span>⏱️ {alert.time}</span>
                      {alert.source && <span style={{ color: "#10b981" }}>● {alert.source}</span>}
                    </div>
                  </div>
                </div>
                <div className="am-alert-actions">
                  <button
                    className="am-btn-small"
                    style={{ background: COLORS[alert.lvl], color: "#fff", borderColor: COLORS[alert.lvl], opacity: notifying ? 0.6 : 1 }}
                    disabled={notifying}
                    onClick={() => sendNotification(alert)}
                  >
                    📱 Notify
                  </button>
                  <button
                    className="am-btn-small"
                    onClick={() => setViewedId((prev) => (prev === alert.id ? null : alert.id))}
                  >
                    {viewedId === alert.id ? "Hide" : "View"}
                  </button>
                  <button className="am-btn-small am-btn-dismiss" onClick={() => dismiss(alert.id)}>
                    Dismiss
                  </button>
                </div>
              </div>

              {viewedId === alert.id && (
                <div className="am-alert-detail">
                  <div className="am-detail-row">
                    <span className="am-detail-lbl">Risk Level</span>
                    <span className="am-detail-val" style={{ color: COLORS[alert.lvl], fontWeight: 700 }}>
                      {LABELS[alert.lvl]}
                    </span>
                  </div>
                  {alert.sensor && (
                    <div className="am-detail-row">
                      <span className="am-detail-lbl">Sensor / Station</span>
                      <span className="am-detail-val" style={{ fontFamily: "monospace" }}>{alert.sensor}</span>
                    </div>
                  )}
                  <div className="am-detail-row">
                    <span className="am-detail-lbl">Zone</span>
                    <span className="am-detail-val">{alert.zone}</span>
                  </div>
                  <div className="am-detail-row">
                    <span className="am-detail-lbl">Reported</span>
                    <span className="am-detail-val">{alert.time}</span>
                  </div>
                  {alert.rainfall_mm !== undefined && (
                    <div className="am-detail-row">
                      <span className="am-detail-lbl">Rainfall</span>
                      <span className="am-detail-val"
                        style={{ color: alert.rainfall_mm >= 70 ? "#dc2626" : undefined, fontWeight: alert.rainfall_mm >= 70 ? 700 : undefined }}>
                        {alert.rainfall_mm.toFixed(1)} mm/h
                        {alert.rainfall_mm >= 70 && " ⚠ Exceeds 70mm/h threshold"}
                      </span>
                    </div>
                  )}
                  {alert.humidity_pct !== undefined && (
                    <div className="am-detail-row">
                      <span className="am-detail-lbl">Humidity</span>
                      <span className="am-detail-val">{alert.humidity_pct.toFixed(0)}%</span>
                    </div>
                  )}
                  {alert.temperature_c !== undefined && (
                    <div className="am-detail-row">
                      <span className="am-detail-lbl">Temperature</span>
                      <span className="am-detail-val">{alert.temperature_c.toFixed(1)}°C</span>
                    </div>
                  )}
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

      {/* ── Active rules ── */}
      {rules.length > 0 && (
        <div className="am-panel" style={{ marginBottom: 24 }}>
          <h2 className="am-panel-title">Active Rules ({rules.length})</h2>
          <div className="am-rules-list">
            {rules.map((rule, i) => (
              <div key={i} className="am-rule-item">
                <span className="am-rule-condition">{rule.sensor}</span>
                <span className="am-rule-sep">·</span>
                <span className="am-rule-condition">{rule.condition}</span>
                <span className="am-rule-sep">→</span>
                <span className="am-rule-notify">{rule.notify}</span>
                {rule.message && <span className="am-rule-msg">"{rule.message}"</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Send custom message ── */}
      <div className="am-panel" style={{ marginBottom: 24 }}>
        <h2 className="am-panel-title">📱 Send <map name=""></map>message to Mobile App</h2>
        {msgResult && (
          <div style={{
            marginBottom: 12, padding: "10px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            background: msgResult.ok ? "#d1fae5" : "#fef3c7",
            color:      msgResult.ok ? "#065f46" : "#92400e",
            border:     `1px solid ${msgResult.ok ? "#6ee7b7" : "#fde68a"}`,
          }}>
            {msgResult.text}
          </div>
        )}
        <form className="am-form" onSubmit={sendCustomMessage}>
          <div className="am-form-row">
            <div className="am-form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Evacuation Order — Kanama Sector"
                value={msgForm.title}
                onChange={(e) => setMsgForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="am-form-group">
              <label>Severity</label>
              <select value={msgForm.level} onChange={(e) => setMsgForm((f) => ({ ...f, level: e.target.value }))}>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="moderate">🟡 Moderate</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div className="am-form-group" style={{ marginBottom: 12 }}>
            <label>Message</label>
            <textarea
              rows={3}
              placeholder="e.g. Sebeya River has exceeded the 2.5m critical threshold. Evacuate riverside communities in Kanama immediately."
              value={msgForm.body}
              onChange={(e) => setMsgForm((f) => ({ ...f, body: e.target.value }))}
              required
              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, resize: "vertical" }}
            />
          </div>
          <button
            type="submit"
            className="am-btn-submit"
            disabled={msgSending}
            style={{ opacity: msgSending ? 0.6 : 1 }}
          >
            {msgSending ? "Sending…" : "📤 Send to Mobile App"}
          </button>
        </form>
      </div>

      {/* ── Create alert rule ── */}
      <div className="am-panel">
        <h2 className="am-panel-title">Create New Alert Rule — Sebeya River Basin</h2>
        {ruleSuccess && (
          <div className="am-success-banner">✅ Alert rule created successfully!</div>
        )}
        <form className="am-form" onSubmit={createRule}>
          <div className="am-form-row">
            <div className="am-form-group">
              <label>Sensor / Station</label>
              <select value={ruleForm.sensor} onChange={(e) => setRuleForm((f) => ({ ...f, sensor: e.target.value }))}>
                <option>All Sebeya Sensors</option>
                <option>SEBY-DS-03 — Kanama (Downstream)</option>
                <option>SEBY-MS-02 — Nyundo (Midstream)</option>
                <option>SEBY-US-01 — Rutsiro (Upstream)</option>
              </select>
            </div>
            <div className="am-form-group">
              <label>Condition</label>
              <select value={ruleForm.condition} onChange={(e) => setRuleForm((f) => ({ ...f, condition: e.target.value }))}>
                <option>River level &gt; 2.5m (critical threshold)</option>
                <option>Rainfall &gt; 70mm/h (critical threshold)</option>
                <option>River level &gt; 2.0m (high alert)</option>
                <option>Rainfall &gt; 50mm/h (high alert)</option>
                <option>ML risk score &gt; 80%</option>
                <option>Humidity &gt; 92%</option>
              </select>
            </div>
          </div>
          <div className="am-form-row">
            <div className="am-form-group">
              <label>Notify</label>
              <select value={ruleForm.notify} onChange={(e) => setRuleForm((f) => ({ ...f, notify: e.target.value }))}>
                <option>MINEMA / District Authority</option>
                <option>Rwanda Water Resources Board (RWB)</option>
                <option>Meteo Rwanda</option>
                <option>All Registered Users</option>
                <option>Rubavu District Office</option>
                <option>Rutsiro District Office</option>
                <option>Admins Only</option>
              </select>
            </div>
            <div className="am-form-group">
              <label>Message</label>
              <input
                type="text"
                placeholder="e.g. Evacuate Kanama riverside sector immediately"
                value={ruleForm.message}
                onChange={(e) => setRuleForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="am-btn-submit">➕ Create Alert Rule</button>
        </form>
      </div>

    </div>
  );
}
