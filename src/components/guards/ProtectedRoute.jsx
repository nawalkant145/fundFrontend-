import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../ui/PageLoader";

                                                                                                                                                                                                                          
export default function ProtectedRoute({ children, roles, allowSignupSession }) {
  const { user, loading } = useAuth();
  const location = useLocation();

                                                                  
  if (loading) {
    return <PageLoader text="Loading your workspace…" />;
  }

                                                                                               
  if (!user && allowSignupSession) {
    const params = new URLSearchParams(location.search);
    const signupSessionId =
      params.get("session") || sessionStorage.getItem("signupSessionId");
    if (signupSessionId) {
      return children;
    }
  }



                                                                     
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

                             
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

