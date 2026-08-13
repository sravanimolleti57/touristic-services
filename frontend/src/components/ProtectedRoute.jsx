import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute component for role-based authorization.
 * Options:
 * - requireAdmin: true -> must be logged in as role "admin". Otherwise redirects to /login.
 * - requireUser: true -> must be logged in as role "user". If admin, redirects to /admin/dashboard.
 */
export default function ProtectedRoute({ children, requireAdmin = false, requireUser = false }) {
  const userStr = localStorage.getItem("user");
  const role = localStorage.getItem("role") || (userStr ? JSON.parse(userStr).role : null);

  if (!userStr) {
    // Not logged in -> redirect to Landing page or login
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;
  }

  if (requireAdmin && role !== "admin") {
    // User trying to access Admin pages -> block and redirect to user home
    return <Navigate to="/home" replace />;
  }

  if (requireUser && role === "admin") {
    // Admin trying to access regular user home -> redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
