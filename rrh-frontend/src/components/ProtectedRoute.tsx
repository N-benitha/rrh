import { Navigate, Outlet } from "react-router";
import { apiService } from "../services/api";

export default function ProtectedRoute() {
  if (!apiService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
