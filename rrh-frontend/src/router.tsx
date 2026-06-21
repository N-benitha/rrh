import { createBrowserRouter, Navigate } from "react-router";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyPage from "./pages/VerifyPage";
import HelpPage from "./pages/HelpPage";
import AboutPage from "./pages/AboutPage";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashMap from "./components/dashboard/DashMap";
import AlertsManagementPage from "./pages/dashboard/AlertsManagementPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import UserManagementPage from "./pages/dashboard/UserManagementPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import { ChangePasswordPage } from "./pages/dashboard/ChangePasswordPage";
import { AccountActionsPage } from "./pages/dashboard/AccountActionsPage";
import { SignOutPage } from "./pages/dashboard/SignOutPage";
import AdminRoute from "./components/AdminRoute";

export const router = createBrowserRouter([
  // Public pages — shared Navbar layout
  {
    element: <PublicLayout />,
    children: [
      { path: "/",          element: <LandingPage /> },
      { path: "/login",     element: <LoginPage /> },
      { path: "/register",  element: <RegisterPage /> },
      { path: "/help",      element: <HelpPage /> },
      { path: "/about",     element: <AboutPage /> },
    ],
  },
  // Auth pages without Navbar
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/verify",          element: <VerifyPage /> },
  // Protected dashboard
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
        children: [
          { index: true,           element: <DashboardOverview /> },
          { path: "map",           element: <div style={{ height: "calc(100vh - 120px)", minHeight: 500, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}><DashMap /></div> },
          { path: "alerts",        element: <AlertsManagementPage /> },
          { element: <AdminRoute />, children: [
            { path: "analytics",   element: <AnalyticsPage /> },
            { path: "users",       element: <UserManagementPage /> },
          ]},
          { path: "reports",       element: <ReportsPage /> },
          { path: "settings",      element: <SettingsPage /> },
          { path: "profile",       element: <ProfilePage /> },
          { path: "password",      element: <ChangePasswordPage /> },
          { path: "account",       element: <AccountActionsPage /> },
          { path: "sign-out",      element: <SignOutPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
