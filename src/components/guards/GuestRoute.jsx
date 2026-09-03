import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../ui/PageLoader";

                                                                                                                                             
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  }

  return children;
}
