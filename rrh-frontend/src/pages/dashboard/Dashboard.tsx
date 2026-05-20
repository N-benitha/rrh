import { useState } from "react";
import { apiService } from "../../services/api";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";
import type { PageProps } from "../../types";
import DashSidebar from "../../components/dashboard/DashSidebar";
import DashTopBar from "../../components/dashboard/DashTopBar";
import DashboardOverview from "./DashboardOverview";
import DashMap from "../../components/dashboard/DashMap";
import ZoneDetailPage from "./ZoneDetailPage";
import AlertsManagementPage from "./AlertsManagementPage";
import AnalyticsPage from "./AnalyticsPage";
import ReportsPage from "./ReportsPage";
import SettingsPage from "./SettingsPage";
import ProfilePage from "./ProfilePage";
import { NotificationsPage } from "./NotificationsPage";
import { ThresholdsPage } from "./ThresholdsPage";
import { AppearancePage } from "./AppearancePage";
import { DataPrivacyPage } from "./DataPrivacyPage";
import { PersonalInfoPage } from "./PersonalInfoPage";
import { ChangePasswordPage } from "./ChangePasswordPage";
import { AccountActionsPage } from "./AccountActionsPage";
import { SignOutPage } from "./SignOutPage";
import UserManagementPage from "./UserManagementPage";
import LiveTickerBanner from "../../components/dashboard/LiveTickerBanner";

export default function Dashboard({ setPage }: PageProps) {
  const [activeNav, setActiveNav] = useState("overview");

  const handleLogout = () => {
    apiService.clearAuth();
    setPage("landing");
  };

  const { showWarning, resetTimer } = useIdleTimeout(handleLogout);

  const pageTitles: { [key: string]: string } = {
    overview: "Dashboard Overview",
    map: "Live Risk Map",
    alerts: "Alert Management",
    analytics: "Advanced Analytics",
    zones: "Risk Zones",
    reports: "Reports",
    users: "User Management",
    settings: "Settings & Preferences",
    notifications: "Notification Preferences",
    thresholds: "Alert Thresholds",
    appearance: "Appearance Settings",
    privacy: "Data & Privacy",
    profile: "My Profile",
    personalinfo: "Personal Information",
    password: "Change Password",
    account: "Account Actions",
    signout: "Sign Out",
  };

  const getTitle = () => pageTitles[activeNav] || "Dashboard";

  return (
    <>
      <LiveTickerBanner />
      {showWarning && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "#7c2d12", color: "#fff", padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "var(--serif)", fontSize: 14, boxShadow: "0 2px 12px rgba(0,0,0,.4)",
        }}>
          <span>⚠ You have been inactive for nearly 2 hours. You will be logged out in 5 minutes.</span>
          <button onClick={resetTimer} style={{
            background: "#fff", color: "#7c2d12", border: "none", borderRadius: 6,
            padding: "6px 16px", fontFamily: "var(--serif)", fontWeight: 700,
            fontSize: 13, cursor: "pointer", flexShrink: 0, marginLeft: 16,
          }}>
            Stay logged in
          </button>
        </div>
      )}
      <div className="db-container">
        <DashSidebar active={activeNav} setActive={setActiveNav} setPage={setPage} />
        <div className="db-main">
          <DashTopBar title={getTitle()} />
          <div className="db-content">
            {activeNav === "overview" && <DashboardOverview />}
            {activeNav === "map" && (
              <div style={{ height: "calc(100vh - 120px)", minHeight: 500, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                <DashMap />
              </div>
            )}
            {activeNav === "alerts" && <AlertsManagementPage />}
            {activeNav === "analytics" && <AnalyticsPage />}
            {activeNav === "zones" && (
              <ZoneDetailPage zoneId={1} onBack={() => setActiveNav("overview")} onNavigate={setActiveNav} />
            )}
            {activeNav === "reports" && <ReportsPage />}
            {activeNav === "users" && <UserManagementPage />}
            {activeNav === "settings" && <SettingsPage />}
            {activeNav === "notifications" && <NotificationsPage />}
            {activeNav === "thresholds" && <ThresholdsPage />}
            {activeNav === "appearance" && <AppearancePage />}
            {activeNav === "privacy" && <DataPrivacyPage />}
            {activeNav === "profile" && <ProfilePage setPage={setPage} />}
            {activeNav === "personalinfo" && <PersonalInfoPage />}
            {activeNav === "password" && <ChangePasswordPage />}
            {activeNav === "account" && <AccountActionsPage />}
            {activeNav === "signout" && <SignOutPage setPage={setPage} />}
          </div>
        </div>
      </div>
    </>
  );
}
