import { AlertOctagon, AlertTriangle, Info, CheckCircle } from "lucide-react";
import type { Alert } from "../../types";

interface AlertsListProps {
  alerts: Alert[];
  limit?: number;
  selectedZone?: string | null;
  onAlertClick?: (alert: Alert) => void;
}

const LEVEL_ICON = {
  critical: AlertOctagon,
  high:     AlertTriangle,
  moderate: Info,
  low:      CheckCircle,
} as const;

const LEVEL_COLOR = {
  critical: "#EF4444",
  high:     "#F97316",
  moderate: "#EAB308",
  low:      "#22C55E",
} as const;

export default function AlertsList({ alerts, limit = 5, selectedZone, onAlertClick }: AlertsListProps) {
  const displayAlerts = alerts.slice(0, limit);

  return (
    <div className="db-alerts-list">
      {displayAlerts.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
          No alerts at this time. All zones nominal.
        </div>
      ) : (
        displayAlerts.map((alert, i) => {
          const LevelIcon = LEVEL_ICON[alert.level] ?? Info;
          const color = LEVEL_COLOR[alert.level] ?? "#22C55E";
          const isSelected =
            selectedZone &&
            alert.zone.toLowerCase().includes(selectedZone.split(" ")[0].toLowerCase());
          return (
            <div
              key={i}
              className={`db-alert-item alert-${alert.level}${isSelected ? " alert-selected" : ""}`}
              onClick={() => onAlertClick?.(alert)}
            >
              <div className="alert-left">
                <div className="alert-icon" style={{ background: color }}>
                  <LevelIcon size={18} color="#fff" />
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
          );
        })
      )}
    </div>
  );
}
