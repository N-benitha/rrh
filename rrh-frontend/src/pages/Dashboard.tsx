import { useState } from "react";
import type { PageProps } from "../types";
import DashSidebar from "../components/dashboard/DashSidebar";
import DashTopBar from "../components/dashboard/DashTopBar";
import DashboardOverview from "../components/dashboard/DashboardOverview";
import DashMap from "../components/dashboard/DashMap";
import ZoneDetailPage from "../components/dashboard/ZoneDetailPage";
import AlertsManagementPage from "../components/dashboard/AlertsManagementPage";
import AnalyticsPage from "../components/dashboard/AnalyticsPage";
import ReportsPage from "../components/dashboard/ReportsPage";
import SettingsPage from "../components/dashboard/SettingsPage";
import ProfilePage from "../components/dashboard/ProfilePage";
import { NotificationsPage } from "../components/dashboard/NotificationsPage";
import { ThresholdsPage } from "../components/dashboard/ThresholdsPage";
import { AppearancePage } from "../components/dashboard/AppearancePage";
import { DataPrivacyPage } from "../components/dashboard/DataPrivacyPage";
import { PersonalInfoPage } from "../components/dashboard/PersonalInfoPage";
import { ChangePasswordPage } from "../components/dashboard/ChangePasswordPage";
import { AccountActionsPage } from "../components/dashboard/AccountActionsPage";
import { SignOutPage } from "../components/dashboard/SignOutPage";
import LiveTickerBanner from "../components/dashboard/LiveTickerBanner";

/**
 * Dashboard � Rwanda Resilience Hub Command Center
 */

export default function Dashboard({ setPage }: PageProps) {
  const [activeNav, setActiveNav] = useState("overview");

  const pageTitles: { [key: string]: string } = {
    overview: "Dashboard Overview",
    map: "Live Risk Map",
    alerts: "Alert Management",
    analytics: "Advanced Analytics",
    zones: "Risk Zones",
    reports: "Reports",
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
            <div className="db-panel" style={{ height: "600px" }}>
              <DashMap />
            </div>
          )}
          {activeNav === "alerts" && <AlertsManagementPage />}
          {activeNav === "analytics" && <AnalyticsPage />}
          {activeNav === "zones" && <ZoneDetailPage zoneId={1} onBack={() => setActiveNav("overview")} />}
          {activeNav === "reports" && <ReportsPage />}
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
