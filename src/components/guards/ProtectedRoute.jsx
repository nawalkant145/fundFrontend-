import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../ui/PageLoader";

/**
 * Route guard — redirects to /login if not authenticated.
 * Optional `roles` prop restricts to specific roles.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking auth state (initial load), show branded loader
  if (loading) {
    return <PageLoader text="Loading your workspace…" />;
  }

  // Not logged in → redirect to login, preserve intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
