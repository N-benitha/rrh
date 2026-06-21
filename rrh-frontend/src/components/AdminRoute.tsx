import { Navigate, Outlet } from "react-router";
import { useIsAdmin } from "../hooks/useData";

export default function AdminRoute() {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
