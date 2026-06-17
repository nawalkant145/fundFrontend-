import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard — redirects to /login if not authenticated.
 * Optional `roles` prop restricts to specific roles.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>           ← any logged-in user
 *   <Route element={<ProtectedRoute roles={["admin"]} />}> ← admin only
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking auth state (initial load), show nothing to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-3 border-[#1B5E3F]/30 border-t-[#1B5E3F] rounded-full animate-spin" />
      </div>
    );
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
