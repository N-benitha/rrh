import React from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Map,
  Bell,
  BarChart2,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { apiService } from "../../services/api";
import { useIsAdmin } from "../../hooks/useData";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  badge?: string;
  badgeRed?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview",  path: "/dashboard",          label: "Overview",   Icon: LayoutDashboard },
  { id: "map",       path: "/dashboard/map",       label: "Live Map",   Icon: Map,       badge: "5" },
  { id: "alerts",    path: "/dashboard/alerts",    label: "Alerts",     Icon: Bell,      badge: "3", badgeRed: true },
  { id: "analytics", path: "/dashboard/analytics", label: "Analytics",  Icon: BarChart2, adminOnly: true },
  { id: "reports",   path: "/dashboard/reports",   label: "Reports",    Icon: FileText },
  { id: "users",     path: "/dashboard/users",     label: "Users",      Icon: Users,     adminOnly: true },
];

export default function DashSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAdmin, profile } = useIsAdmin();
  const displayName = profile?.name ?? "—";
  const displayRole = profile?.role ?? "—";
  const initials = profile?.name ? getInitials(profile.name) : "—";

  const isActive = (path: string) =>
    path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(path);

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
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(({ id, path, label, Icon, badge, badgeRed }) => (
          <button
            key={id}
            className={`sb-item ${isActive(path) ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon size={16} />
            <span>{label}</span>
            {badge && <span className={`sb-badge ${badgeRed ? "red" : ""}`}>{badge}</span>}
          </button>
        ))}
      </nav>

      <div className="sb-foot">
        <button
          className={`sb-item ${isActive("/dashboard/settings") ? "active" : ""}`}
          onClick={() => navigate("/dashboard/settings")}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>

        <button
          className="sb-item"
          onClick={() => {
            apiService.clearAuth();
            navigate("/");
          }}
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>

        <div
          className="sb-user"
          onClick={() => navigate("/dashboard/profile")}
          style={{ marginTop: "16px", cursor: "pointer" }}
        >
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
