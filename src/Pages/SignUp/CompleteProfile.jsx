import { Navigate } from "react-router";

// Old bookmarks use the dashboard; Root handles incomplete profiles with a modal.
export default function CompleteProfile() {
  return <Navigate to="/student-dashboard" replace />;
}
