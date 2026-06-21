import { useEffect, useState } from "react";
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
import { apiService } from "../../services/api";
import type { Page } from "../../types";

interface SidebarProps {
  active: string;
  setActive: (id: string) => void;
  setPage: (page: Page) => void;
  userRole?: string;
}

const ALL_NAV_ITEMS = [
  { id: "overview",  label: "Overview",   Icon: LayoutDashboard, roles: ["resident","analyst","zone_manager","admin","superadmin"] },
  { id: "map",       label: "Live Map",   Icon: Map,             roles: ["resident","analyst","zone_manager","admin","superadmin"] },
  { id: "alerts",    label: "Alerts",     Icon: Bell,            roles: ["resident","analyst","zone_manager","admin","superadmin"] },
  { id: "analytics", label: "Analytics",  Icon: BarChart2,       roles: ["analyst","zone_manager","admin","superadmin"] },
  { id: "zones",     label: "Risk Zones", Icon: MapPin,          roles: ["analyst","zone_manager","admin","superadmin"] },
  { id: "reports",   label: "Reports",    Icon: FileText,        roles: ["analyst","admin","superadmin"] },
  { id: "users",     label: "Users",      Icon: Users,           roles: ["admin","superadmin"] },
];

const NAV_BOTTOM = [
  { id: "settings", label: "Settings",  Icon: Settings },
  { id: "logout",   label: "Sign out",  Icon: LogOut },
];

export default function DashSidebar({ active, setActive, setPage, userRole }: SidebarProps) {
  const [user, setUser] = useState({ full_name: "Yvette Tuyizere", role: userRole || "resident" });

  useEffect(() => {
    apiService.validateToken().then((u) => {
      setUser({
        full_name: u.full_name || "Yvette Tuyizere",
        role: u.role?.toLowerCase() || "resident",
      });
    }).catch(() => {});
  }, []);

  const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1).replace("_", " ");
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(user.role));

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
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sb-item ${active === id ? "active" : ""}`}
            onClick={() => setActive(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
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
            <div className="sb-uname">{user.full_name}</div>
            <div className="sb-urole">{roleLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
