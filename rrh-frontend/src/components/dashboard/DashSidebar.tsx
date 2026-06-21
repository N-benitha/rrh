import {
  LayoutDashboard,
  Map,
  Bell,
  BarChart2,
  // MapPin,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { apiService } from "../../services/api";
import { useIsAdmin } from "../../hooks/useData";
import type { Page } from "../../types";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}

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
  // { id: "zones",      label: "Risk Zones",  Icon: MapPin },
  { id: "reports",    label: "Reports",     Icon: FileText },
  { id: "users",      label: "Users",       Icon: Users },
];

const NAV_BOTTOM = [
  { id: "settings", label: "Settings",  Icon: Settings },
  { id: "logout",   label: "Sign out",  Icon: LogOut },
];

export default function DashSidebar({ active, setActive, setPage }: SidebarProps) {
  const { profile } = useIsAdmin();
  const displayName = profile?.name ?? "—";
  const displayRole = profile?.role ?? "—";
  const initials = profile?.name ? getInitials(profile.name) : "—";

  return (
    <div className="db-sidebar">
      <div className="sb-brand">
        <div className="sb-mark">
          <img src="/logo.png" alt="RRH" style={{ width: "24px", height: "24px", objectFit: "contain", display: "block" }} />
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
            onClick={() => {
              if (id === "logout") {
                apiService.clearAuth();
                setPage("landing");
              } else {
                setActive(id);
              }
            }}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}

        <div className="sb-user" onClick={() => setActive("profile")} style={{ marginTop: "16px", cursor: "pointer" }}>
          <div className="sb-avatar">{initials}</div>
          <div>
            <div className="sb-uname">{displayName}</div>
            <div className="sb-urole">{displayRole}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
