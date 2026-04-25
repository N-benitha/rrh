

interface Alert {
  level: "critical" | "high" | "moderate" | "low";
  icon: string;
  title: string;
  description: string;
  zone: string;
  time: string;
}

interface AlertsListProps {
  alerts: Alert[];
  limit?: number;
}

const levelColors = {
  critical: "#EF4444",
  high: "#F97316",
  moderate: "#EAB308",
  low: "#22C55E",
};

export default function AlertsList({ alerts, limit = 5 }: AlertsListProps) {
  const displayAlerts = alerts.slice(0, limit);

  return (
    <div className="db-alerts-list">
      {displayAlerts.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
          No alerts at this time. All zones nominal.
        </div>
      ) : (
        displayAlerts.map((alert, i) => (
          <div key={i} className={`db-alert-item alert-${alert.level}`}>
            <div className="alert-left">
              <div className="alert-icon" style={{ background: levelColors[alert.level] }}>
                {alert.icon}
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-desc">{alert.description}</div>
                <div className="alert-meta">
                  <span>{alert.zone}</span>
                  <span className="alert-time">{alert.time}</span>
                </div>
              </div>
            </div>
            <div className="alert-action">→</div>
          </div>
        ))
      )}
    </div>
  );
}
