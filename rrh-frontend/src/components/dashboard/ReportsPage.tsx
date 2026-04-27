import { useState } from "react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("weekly");

  const handleDownload = (reportName: string, format: string = "pdf") => {
    const fileName = `${reportName.replace(/ /g, "_")}.${format === "PDF Report" ? "pdf" : format === "Excel Spreadsheet" ? "xlsx" : "json"}`;
    
    // Create a blob and trigger download
    const content = `Report: ${reportName}\nGenerated: ${new Date().toLocaleString()}\nFormat: ${format}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    const timestamp = new Date().toLocaleString();
    const content = `${reportType.toUpperCase()} REPORT\nGenerated: ${timestamp}\n\nThis is your generated report in the requested format.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RRH_${reportType}_report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };


  const reports = [
    {
      id: 1,
      name: "Weekly Summary - Apr 8-15",
      type: "weekly",
      date: "Apr 15, 2026",
      zones: 5,
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Daily Report - Apr 15",
      type: "daily",
      date: "Apr 15, 2026",
      zones: 5,
      size: "456 KB",
    },
    {
      id: 3,
      name: "Monthly Summary - March 2026",
      type: "monthly",
      date: "Mar 31, 2026",
      zones: 5,
      size: "8.7 MB",
    },
  ];

  return (
    <div className="db-reports">
      {/* Quick Stats */}
      <div className="rep-stats">
        <div className="rep-stat-item">
          <div className="rep-stat-val">12</div>
          <div className="rep-stat-lbl">Reports Generated</div>
        </div>
        <div className="rep-stat-item">
          <div className="rep-stat-val">4.2 GB</div>
          <div className="rep-stat-lbl">Total Storage</div>
        </div>
        <div className="rep-stat-item">
          <div className="rep-stat-val">5</div>
          <div className="rep-stat-lbl">Monitored Zones</div>
        </div>
      </div>

      {/* Generate New Report */}
      <div className="rep-panel">
        <h2 className="rep-panel-title">Generate New Report</h2>
        <form className="rep-form">
          <div className="rep-form-row">
            <div className="rep-form-group">
              <label>Report Type</label>
              <div className="rep-type-options">
                {["daily", "weekly", "monthly"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`rep-type-btn ${reportType === type ? "active" : ""}`}
                    onClick={() => setReportType(type as any)}
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
        </form>
      </div>

      {/* Recent Reports */}
      <div className="rep-panel">
        <h2 className="rep-panel-title">Recent Reports</h2>
        <div className="rep-list">
          {reports.map((report) => (
            <div key={report.id} className="rep-item">
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
                <button className="rep-btn-small" onClick={() => handleDownload(report.name, "PDF Report")}>⬇️ Download</button>
                <button className="rep-btn-small">👁️ View</button>
                <button className="rep-btn-small">⋯</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="rep-panel">
        <h2 className="rep-panel-title">Scheduled Reports</h2>
        <div className="rep-scheduled">
          <div className="rep-scheduled-item">
            <div>
              <h3>Daily Report</h3>
              <p>Every day at 6:00 AM UTC • Sent to admin@rrh.org</p>
            </div>
            <div className="rep-toggle-switch">
              <input type="checkbox" defaultChecked id="daily-toggle" />
              <label htmlFor="daily-toggle"></label>
            </div>
          </div>
          <div className="rep-scheduled-item">
            <div>
              <h3>Weekly Summary</h3>
              <p>Every Monday at 8:00 AM UTC • Sent to 5 recipients</p>
            </div>
            <div className="rep-toggle-switch">
              <input type="checkbox" defaultChecked id="weekly-toggle" />
              <label htmlFor="weekly-toggle"></label>
            </div>
          </div>
          <div className="rep-scheduled-item">
            <div>
              <h3>Monthly Analysis</h3>
              <p>1st of every month at 10:00 AM UTC • Sent to 8 recipients</p>
            </div>
            <div className="rep-toggle-switch">
              <input type="checkbox" defaultChecked id="monthly-toggle" />
              <label htmlFor="monthly-toggle"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
