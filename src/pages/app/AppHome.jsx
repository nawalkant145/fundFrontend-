// Smart router — sends founder to dashboard, investor to feed,
// admin to admin dashboard. Reads role from localStorage auth.
import { Navigate } from "react-router-dom";
import FounderDashboard from "./FounderDashboard";
import InvestorFeed from "./InvestorFeed";
import { getRole } from "../../lib/auth";

export default function AppHome() {
  const role = getRole();
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "investor") return <InvestorFeed />;
  // default → founder
  return <FounderDashboard />;
}
