import { AlertOctagon, AlertTriangle, Info, CheckCircle } from "lucide-react";
import type { Alert } from "../../types";

interface AlertsListProps {
  alerts: Alert[];
  limit?: number;
  onAlertClick?: (alert: Alert) => void;
}

const LEVEL_ICON = {
  critical: AlertOctagon,
  high:     AlertTriangle,
  moderate: Info,
  low:      CheckCircle,
} as const;

const LEVEL_COLOR: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  moderate: "#EAB308",
  low:      "#22C55E",
};

const TITLE_MAP: Record<string, string> = {
  critical: "Critical Flood Risk Alert",
  high:     "High Flood Risk Alert",
  moderate: "Moderate Flood Risk Warning",
  low:      "Low Flood Risk Notice",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AlertsList({ alerts, limit = 5, onAlertClick }: AlertsListProps) {
  const displayAlerts = alerts.slice(0, limit);

  return (
    <div className="db-alerts-list">
      {displayAlerts.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
          No alerts at this time. All zones nominal.
        </div>
      ) : (
        displayAlerts.map((alert) => {
          const level = alert.risk_level.toLowerCase();
          const LevelIcon = LEVEL_ICON[level as keyof typeof LEVEL_ICON] ?? Info;
          const color = LEVEL_COLOR[level] ?? "#22C55E";
          return (
            <div
              key={alert.id}
              className={`db-alert-item alert-${level}`}
              onClick={() => onAlertClick?.(alert)}
            >
              <div className="alert-left">
                <div className="alert-icon" style={{ background: color }}>
                  <LevelIcon size={18} color="#fff" />
                </div>
                <div className="alert-content">
                  <div className="alert-title">{TITLE_MAP[level] ?? "Flood Risk Alert"}</div>
                  <div className="alert-desc">{alert.message}</div>
                  <div className="alert-meta">
                    <span>{alert.region_name ?? alert.region_id}</span>
                    <span className="alert-time">{formatTime(alert.created_at)}</span>
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
