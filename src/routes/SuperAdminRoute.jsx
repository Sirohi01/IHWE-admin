import { Navigate } from "react-router-dom";
import { isCurrentUserSuperAdmin } from "../utils/roles";

// Renders children only for the "IHWE–Super Administrator" role; everyone else goes to /dashboard.
export default function SuperAdminRoute({ children }) {
  if (!isCurrentUserSuperAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
