import { useState } from "react";
import type { PageProps } from "../../types";
import DashSidebar from "../../components/dashboard/DashSidebar";
import DashTopBar from "../../components/dashboard/DashTopBar";
import DashboardOverview from "./DashboardOverview";
import DashMap from "../../components/dashboard/DashMap";
import AlertsManagementPage from "./AlertsManagementPage";
import AnalyticsPage from "./AnalyticsPage";
import ReportsPage from "./ReportsPage";
import SettingsPage from "./SettingsPage";
import ProfilePage from "./ProfilePage";
import { NotificationsPage } from "./NotificationsPage";
import { ThresholdsPage } from "./ThresholdsPage";
import { AppearancePage } from "./AppearancePage";
import { DataPrivacyPage } from "./DataPrivacyPage";
import { ChangePasswordPage } from "./ChangePasswordPage";
import { AccountActionsPage } from "./AccountActionsPage";
import { SignOutPage } from "./SignOutPage";
import UserManagementPage from "./UserManagementPage";
import LiveTickerBanner from "../../components/dashboard/LiveTickerBanner";

export default function Dashboard({ setPage }: PageProps) {
  const [activeNav, setActiveNav] = useState("overview");

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
            {/* {activeNav === "zones" && (
              <ZoneDetailPage zoneId={1} onBack={() => setActiveNav("overview")} onNavigate={setActiveNav} />
            )} */}
            {activeNav === "reports" && <ReportsPage />}
            {activeNav === "users" && <UserManagementPage />}
            {activeNav === "settings" && <SettingsPage />}
            {activeNav === "notifications" && <NotificationsPage />}
            {activeNav === "thresholds" && <ThresholdsPage />}
            {activeNav === "appearance" && <AppearancePage />}
            {activeNav === "privacy" && <DataPrivacyPage />}
            {activeNav === "profile" && <ProfilePage setPage={setPage} />}
            {activeNav === "password" && <ChangePasswordPage />}
            {activeNav === "account" && <AccountActionsPage />}
            {activeNav === "signout" && <SignOutPage setPage={setPage} />}
          </div>
        </div>
      </div>
    </>
  );
}
