import { useState, useEffect } from "react";

type ReportType = "daily" | "weekly" | "monthly";
type Report = { id: number; name: string; type: ReportType; date: string; zones: number; size: string };

const PREVIEWS: Record<ReportType, { zones: string[]; alerts: number; pages: number }> = {
  weekly:  { zones: ["Nyabugogo Wetland", "Sebeya River Basin", "Nyabarongo River", "Kigali Urban Zone", "Akagera Wetlands"], alerts: 3,  pages: 12 },
  daily:   { zones: ["Nyabugogo Wetland", "Sebeya River Basin", "Nyabarongo River", "Kigali Urban Zone", "Akagera Wetlands"], alerts: 1,  pages: 4  },
  monthly: { zones: ["Nyabugogo Wetland", "Sebeya River Basin", "Nyabarongo River", "Kigali Urban Zone", "Akagera Wetlands"], alerts: 8,  pages: 32 },
};

const INITIAL_REPORTS: Report[] = [
  { id: 1, name: "Weekly Summary - Apr 8-15",    type: "weekly",  date: "Apr 15, 2026", zones: 5, size: "2.4 MB" },
  { id: 2, name: "Daily Report - Apr 15",         type: "daily",   date: "Apr 15, 2026", zones: 5, size: "456 KB" },
  { id: 3, name: "Monthly Summary - March 2026",  type: "monthly", date: "Mar 31, 2026", zones: 5, size: "8.7 MB" },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [viewedId, setViewedId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState({ daily: true, weekly: true, monthly: true });

  useEffect(() => {
    if (menuOpenId === null) return;
    const handle = (e: MouseEvent) => {
      const el = document.getElementById(`rep-menu-${menuOpenId}`);
      if (el && !el.contains(e.target as Node)) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpenId]);

  const triggerDownload = (name: string, ext: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/ /g, "_")}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = (report: Report, format = "pdf") => {
    const ext = format === "xlsx" ? "xlsx" : format === "json" ? "json" : "pdf";
    triggerDownload(report.name, ext, `Report: ${report.name}\nGenerated: ${new Date().toLocaleString()}`);
    setMenuOpenId(null);
  };

  const handleGenerateReport = () => {
    const content = `${reportType.toUpperCase()} REPORT\nGenerated: ${new Date().toLocaleString()}\nZones: ${PREVIEWS[reportType].zones.join(", ")}`;
    triggerDownload(`RRH_${reportType}_report_${Date.now()}`, "txt", content);
  };

  const deleteReport = (id: number) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setMenuOpenId(null);
    if (viewedId === id) setViewedId(null);
  };

  return (
    <div className="db-reports">
      {/* Quick Stats */}
      <div className="rep-stats">
        <div className="rep-stat-item">
          <div className="rep-stat-val">{reports.length + 9}</div>
          <div className="rep-stat-lbl">📊 Reports Generated</div>
        </div>
        <div className="rep-stat-item">
          <div className="rep-stat-val">4.2 GB</div>
          <div className="rep-stat-lbl">💾 Total Storage</div>
        </div>
        <div className="rep-stat-item">
          <div className="rep-stat-val">5</div>
          <div className="rep-stat-lbl">📍 Monitored Zones</div>
        </div>
      </div>

      {/* Generate New Report */}
      <div className="rep-panel">
        <h2 className="rep-panel-title">✨ Generate New Report</h2>
        <div className="rep-form">
          <div className="rep-form-row">
            <div className="rep-form-group">
              <label>Report Type</label>
              <div className="rep-type-options">
                {(["daily", "weekly", "monthly"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`rep-type-btn ${reportType === type ? "active" : ""}`}
                    onClick={() => setReportType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="rep-form-group">
              <label>Date Range</label>
              <input type="date" defaultValue="2026-04-15" />
            </div>
          </div>

          <div className="rep-form-group">
            <label>Include Zones</label>
            <div className="rep-zones-list">
              {["Nyabugogo Wetland", "Sebeya River Basin", "Nyabarongo River", "Kigali Urban Zone", "Akagera Wetlands"].map(
                (zone, i) => (
                  <label key={i} className="rep-zone-checkbox">
                    <input type="checkbox" defaultChecked={i < 3} />
                    {zone}
                  </label>
                ),
              )}
            </div>
          </div>

          <div className="rep-form-group">
            <label>Format</label>
            <select>
              <option>PDF Report</option>
              <option>Excel Spreadsheet</option>
              <option>JSON Data</option>
            </select>
          </div>

          <button type="button" className="rep-btn-generate" onClick={handleGenerateReport}>
            📄 Generate Report
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rep-panel">
        <h2 className="rep-panel-title">📋 Recent Reports</h2>
        <div className="rep-list">
          {reports.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>No reports yet.</div>
          ) : (
            reports.map((report) => {
              const preview = PREVIEWS[report.type];
              const isViewed = viewedId === report.id;
              const isMenuOpen = menuOpenId === report.id;
              return (
                <div key={report.id}>
                  <div className={`rep-item${isViewed ? " rep-item-open" : ""}`}>
                    <div className="rep-item-left">
                      <div className="rep-item-icon">
                        {report.type === "daily" ? "📅" : report.type === "weekly" ? "📊" : "📈"}
                      </div>
                      <div>
                        <h3 className="rep-item-name">{report.name}</h3>
                        <p className="rep-item-meta">
                          {report.date} • {report.zones} zones • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="rep-item-actions">
                      <button className="rep-btn-small" onClick={() => handleDownload(report)}>
                        ⬇️ Download
                      </button>
                      <button
                        className="rep-btn-small"
                        onClick={() => setViewedId(isViewed ? null : report.id)}
                      >
                        {isViewed ? "✕ Close" : "👁️ View"}
                      </button>
                      <div className="rep-menu-wrap" id={`rep-menu-${report.id}`}>
                        <button
                          className="rep-btn-small"
                          onClick={() => setMenuOpenId(isMenuOpen ? null : report.id)}
                        >
                          ⋯
                        </button>
                        {isMenuOpen && (
                          <div className="rep-menu">
                            <button className="rep-menu-item" onClick={() => handleDownload(report, "xlsx")}>
                              Export as Excel
                            </button>
                            <button className="rep-menu-item" onClick={() => handleDownload(report, "json")}>
                              Export as JSON
                            </button>
                            <button className="rep-menu-item danger" onClick={() => deleteReport(report.id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {isViewed && (
                    <div className="rep-view-panel">
                      <div className="rep-view-stats">
                        <div className="rep-view-stat">
                          <div className="rep-view-stat-val">{preview.zones.length}</div>
                          <div className="rep-view-stat-lbl">Zones</div>
                        </div>
                        <div className="rep-view-stat">
                          <div className="rep-view-stat-val">{preview.alerts}</div>
                          <div className="rep-view-stat-lbl">Alerts Logged</div>
                        </div>
                        <div className="rep-view-stat">
                          <div className="rep-view-stat-val">{preview.pages}</div>
                          <div className="rep-view-stat-lbl">Pages</div>
                        </div>
                      </div>
                      <p className="rep-view-summary">
                        <strong>Zones covered:</strong> {preview.zones.join(", ")}.<br />
                        <strong>Generated:</strong> {report.date}&nbsp;&nbsp;|&nbsp;&nbsp;
                        <strong>File size:</strong> {report.size}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="rep-panel">
        <h2 className="rep-panel-title">⏰ Scheduled Reports</h2>
        <div className="rep-scheduled">
          {(["daily", "weekly", "monthly"] as const).map((key) => {
            const info = {
              daily:   { label: "Daily Report",     sub: "Every day at 6:00 AM UTC • Sent to admin@rrh.org" },
              weekly:  { label: "Weekly Summary",   sub: "Every Monday at 8:00 AM UTC • Sent to 5 recipients" },
              monthly: { label: "Monthly Analysis", sub: "1st of every month at 10:00 AM UTC • Sent to 8 recipients" },
            }[key];
            return (
              <div key={key} className="rep-scheduled-item">
                <div>
                  <h3>{info.label}</h3>
                  <p style={{ color: schedule[key] ? undefined : "#9ca3af" }}>{info.sub}</p>
                </div>
                <div className="rep-toggle-switch">
                  <input
                    type="checkbox"
                    id={`${key}-toggle`}
                    checked={schedule[key]}
                    onChange={() => setSchedule((s) => ({ ...s, [key]: !s[key] }))}
                  />
                  <label htmlFor={`${key}-toggle`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
