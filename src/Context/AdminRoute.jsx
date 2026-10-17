import { useContext } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { ShieldAlert } from "lucide-react";
import { AuthContext } from "./AuthContext";
import "../Components/Admin/AdminDashboard.css";

export default function AdminRoute({ children }) {
  const { user, loading, role, roleLoading, roleError, refreshRole } = useContext(AuthContext);
  const location = useLocation();
  if (loading || (user && roleLoading)) {
    return <div className="admin-access" role="status"><span className="loading loading-spinner" />Checking administrator access...</div>;
  }
  if (!user) return <Navigate to="/logIn" state={{ from: location }} replace />;
  if (roleError) {
    return (
      <div className="admin-access">
        <ShieldAlert size={40} aria-hidden="true" />
        <h1>Access could not be verified</h1>
        <p>Please try again to verify your administrator access.</p>
        <button type="button" onClick={() => refreshRole()}>Try again</button>
        <Link to="/">Back to home</Link>
      </div>
    );
  }
  if (role !== "admin") {
    return <Navigate to="/student-dashboard" replace />;
  }
  return children;
}
