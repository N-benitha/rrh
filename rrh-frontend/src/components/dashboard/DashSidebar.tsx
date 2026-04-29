import {
  LayoutDashboard,
  Map,
  Bell,
  BarChart2,
  MapPin,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import type { Page } from "../../types";

interface SidebarProps {
  active: string;
  setActive: (id: string) => void;
  setPage: (page: Page) => void;
}

const NAV_ITEMS = [
  { id: "overview",   label: "Overview",    Icon: LayoutDashboard },
  { id: "map",        label: "Live Map",    Icon: Map,     badge: "5" },
  { id: "alerts",     label: "Alerts",      Icon: Bell,    badge: "3", badgeRed: true },
  { id: "analytics",  label: "Analytics",   Icon: BarChart2 },
  { id: "zones",      label: "Risk Zones",  Icon: MapPin },
  { id: "reports",    label: "Reports",     Icon: FileText },
  { id: "users",      label: "Users",       Icon: Users },
];

const NAV_BOTTOM = [
  { id: "settings", label: "Settings",  Icon: Settings },
  { id: "logout",   label: "Sign out",  Icon: LogOut },
];

export default function DashSidebar({ active, setActive, setPage }: SidebarProps) {
  return (
    <div className="db-sidebar">
      <div className="sb-brand">
        <div className="sb-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: "20px", height: "20px", color: "#F59E0B" }}>
            <path d="M12 22C12 22 4 16 4 10a8 8 0 0 1 16 0c0 6-8 12-8 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </div>
        <div>
          <div className="sb-bname">Rwanda Resilience Hub</div>
          <span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--a200)", letterSpacing: ".09em", textTransform: "uppercase", display: "block" }}>
            Flood Intelligence
          </span>
        </div>
      </div>

      <nav className="sb-nav">
        {NAV_ITEMS.map(({ id, label, Icon, badge, badgeRed }) => (
          <button
            key={id}
            className={`sb-item ${active === id ? "active" : ""}`}
            onClick={() => setActive(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
            {badge && <span className={`sb-badge ${badgeRed ? "red" : ""}`}>{badge}</span>}
          </button>
        ))}
      </nav>

      <div className="sb-foot">
        {NAV_BOTTOM.map(({ id, label, Icon }) => (
          <button
            key={id}
            className="sb-item"
            onClick={() => (id === "logout" ? setPage("landing") : setActive(id))}
          >
            <Icon size={16} />
            <span>{label}</span>
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
