import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../ui/PageLoader";

                                                                                                                                                                          
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
