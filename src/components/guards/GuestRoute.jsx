import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard — redirects to /app if already authenticated.
 * Used on login/signup pages so logged-in users can't re-visit them.
 */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-3 border-[#1B5E3F]/30 border-t-[#1B5E3F] rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  }

  return children;
}
