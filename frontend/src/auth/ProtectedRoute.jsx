import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./authContext.js";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="panel p-8 text-sm text-slate-500">Checking your session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && !(Array.isArray(role) ? role : [role]).includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
