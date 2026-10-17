import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "./AuthContext";
import Loading from "../Pages/Loading/Loading";

export default function PrivateRoute({ children }) {
  const { user, loading, role, roleLoading, roleError, refreshRole, profile } = useContext(AuthContext);
  const location = useLocation();
  if (loading || user && roleLoading) return <Loading />;
  if (!user?.email) return <Navigate to="/logIn" state={{ from: location }} replace />;
  if (roleError) return <div className="admin-access"><h1>Access could not be verified</h1><p>Please retry to check your account access.</p><button type="button" onClick={() => refreshRole()}>Try again</button></div>;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (profile?.profileComplete && location.pathname === "/complete-profile") return <Navigate to="/student-dashboard" replace />;
  // Root presents the one-time completion modal without mounting student tools.
  if (!profile?.profileComplete) return null;
  return children;
}
