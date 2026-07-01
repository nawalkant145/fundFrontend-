import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../ui/PageLoader";

/**
 * Admin route guard. Unlike ProtectedRoute, non-admins (and logged-out users)
 * are redirected to the dedicated /admin/login page rather than the public one.
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader text="Verifying access…" />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
