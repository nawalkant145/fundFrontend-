// Smart router for the /app root.
//   admin    → admin dashboard
//   founder  → linear feed (Pitches + Posts mixed)
//   investor → linear feed (Pitches + Posts mixed)
import { Navigate } from "react-router-dom";
import LinearFeed from "./LinearFeed";
import { getRole } from "../../lib/auth";

export default function AppHome() {
  const role = getRole();
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <LinearFeed />;
}
