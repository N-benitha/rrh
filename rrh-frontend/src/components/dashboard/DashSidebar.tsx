

interface SidebarProps {
  active: string;
  setActive: (id: string) => void;
  setPage: (page: any) => void;
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "map", label: "Live Map", icon: "📍", badge: "5" },
  { id: "alerts", label: "Alerts", icon: "🔔", badge: "3", badgeRed: true },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "zones", label: "Risk Zones", icon: "◉" },
  { id: "reports", label: "Reports", icon: "📄" },
];

const NAV_BOTTOM = [
  { id: "settings", label: "Settings", icon: "⚙" },
  { id: "logout", label: "Sign out", icon: "🚪" },
];

export default function DashSidebar({ active, setActive, setPage }: SidebarProps) {
  const handleLogout = () => {
    setPage("landing");
  };

  return (
    <div className="db-sidebar">
      <div className="sb-brand">
        <div className="sb-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width: "20px", height: "20px", color: "#F59E0B"}}>
            <path d="M12 22C12 22 4 16 4 10a8 8 0 0 1 16 0c0 6-8 12-8 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </div>
        <div>
          <div className="sb-bname">Rwanda Resilience Hub</div>
          <span style={{fontFamily: "var(--mono)", fontSize: "8px", color: "var(--a200)", letterSpacing: ".09em", textTransform: "uppercase", display: "block"}}>Flood Intelligence</span>
        </div>
      </div>

      <nav className="sb-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sb-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className={`sb-badge ${item.badgeRed ? "red" : ""}`}>{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="sb-foot">
        {NAV_BOTTOM.map((item) => (
          <button
            key={item.id}
            className="sb-item"
            onClick={() => (item.id === "logout" ? handleLogout() : setActive(item.id))}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="sb-user" onClick={() => setActive("profile")} style={{ marginTop: "16px", cursor: "pointer" }}>
          <div className="sb-avatar">YT</div>
          <div>
            <div className="sb-uname">Yvette Tuyizere</div>
            <div className="sb-urole">Analyst · Observer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
