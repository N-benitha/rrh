import { useLocation, Outlet } from "react-router";
import DashSidebar from "../../components/dashboard/DashSidebar";
import DashTopBar from "../../components/dashboard/DashTopBar";
import LiveTickerBanner from "../../components/dashboard/LiveTickerBanner";

const PAGE_TITLES: Record<string, string> = {
  "":          "Dashboard Overview",
  map:         "Live Risk Map",
  alerts:      "Alert Management",
  analytics:   "Advanced Analytics",
  reports:     "Reports",
  users:       "User Management",
  settings:    "Settings & Preferences",
  profile:     "My Profile",
  password:    "Change Password",
  account:     "Account Actions",
  "sign-out":  "Sign Out",
};

export default function Dashboard() {
  const { pathname } = useLocation();
  const segment = pathname.replace("/dashboard", "").replace(/^\//, "");
  const title = PAGE_TITLES[segment] ?? "Dashboard";

  return (
    <>
      <LiveTickerBanner />
      <div className="db-container">
        <DashSidebar />
        <div className="db-main">
          <DashTopBar title={title} />
          <div className="db-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
