                                  
                               
                                                   
                                                   
import { Navigate } from "react-router-dom";
import LinearFeed from "./LinearFeed";
import { getRole } from "../../lib/auth";
import { useAuth } from "../../context/AuthContext";

export default function AppHome() {
  const { user } = useAuth();
  const role = user?.role || getRole();
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <LinearFeed />;
}
