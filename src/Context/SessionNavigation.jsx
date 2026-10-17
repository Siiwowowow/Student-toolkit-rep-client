import { useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "./AuthContext";

export default function SessionNavigation() {
  const { user, role, loading, roleLoading, roleError, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const previous = useRef({ uid: null, role: null });
  useEffect(() => {
    if (loading || roleLoading) return;
    const before = previous.current;
    if (!user) {
      previous.current = { uid: null, role: null };
      if (before.uid && before.role && location.pathname !== "/logIn") navigate("/logIn", { replace: true });
      return;
    }
    if (roleError || !role) return;
    previous.current = { uid: user.uid, role };
    if (before.uid === user.uid && before.role && before.role !== role) {
      const destination = role === "admin" ? "/admin" : profile?.profileComplete ? "/student-dashboard" : "/complete-profile";
      if (location.pathname !== destination) navigate(destination, { replace: true });
    }
  }, [user, role, loading, roleLoading, roleError, profile?.profileComplete, location.pathname, navigate]);
  return null;
}
