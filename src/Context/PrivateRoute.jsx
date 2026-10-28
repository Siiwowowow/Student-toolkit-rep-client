import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "./AuthContext";
import Loading from "../Pages/Loading/Loading";

export default function PrivateRoute({ children }) {
  const { user, loading, role, roleLoading, roleError, roleErrorTemporary, refreshRole, profile } = useContext(AuthContext);
  const location = useLocation();
  // Keep only an already verified classroom mounted during a temporary outage.
  // Initial verification, denied access, logout and role changes still block normally.
  const keepClassroom = location.pathname === '/focus-study-mood' && role === 'student' && profile?.profileComplete && roleErrorTemporary;
  if (loading || user && roleLoading) return <Loading />;
  if (!user?.email) return <Navigate to="/logIn" state={{ from: location }} replace />;
  if (roleError && !keepClassroom) return <div className="admin-access"><h1>Access could not be verified</h1><p>Please retry to check your account access.</p><button type="button" onClick={() => refreshRole()}>Try again</button></div>;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (profile?.profileComplete && location.pathname === "/complete-profile") return <Navigate to="/student-dashboard" replace />;
  // Root presents the one-time completion modal without mounting student tools.
  if (!profile?.profileComplete) return null;
  return <>{roleError && keepClassroom ? <p role="status" className="fsm-message">Connection interrupted. Your class stays open while account verification retries.</p> : null}{children}</>;
}
