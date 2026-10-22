import FocusSessionProvider from "../Components/FocusMode/FocusSessionProvider";
import { useContext } from "react";
import { Outlet, useLocation } from "react-router";
import Navbar from "../Components/Navbar/Navbar";
import MobileBottomNav from "../Components/Navbar/MobileBottomNav";
import Footer from "../Components/Footer/Footer";
import { AuthContext } from "../Context/AuthContext";
import NotificationProvider from "../Components/Notifications/NotificationProvider";
import SessionNavigation from "../Context/SessionNavigation";
import ProfileCompletionModal from "../Components/Student/ProfileCompletionModal";
import StudyReminders from "../Components/Student/StudyReminders";
import QuizReminders from "../Components/Student/QuizReminders";

const RootContent = () => {
  const pathname = useLocation().pathname;
  const isLandingPage = pathname === "/";
  const isWorkspace = pathname === "/student-dashboard" || pathname.startsWith("/student-dashboard/") || pathname === "/complete-profile" || pathname.startsWith("/admin/");
  const { user, role, profile, refreshRole } = useContext(AuthContext);

  if (user && role === "student" && profile?.profileComplete === false) {
    return <><SessionNavigation /><ProfileCompletionModal key={user.uid} /></>;
  }

  return (
    <><SessionNavigation /><StudyReminders /><QuizReminders />{pathname === "/admin" || pathname.startsWith("/admin/") ? <Outlet /> : <NotificationProvider user={user} role={role} refreshRole={refreshRole}>
      {isWorkspace ? <Outlet /> :
      <div className="sh-app-shell">
        {isLandingPage ? <Outlet /> : (
          <>
            <Navbar />
            <div className="min-h-[calc(100vh-278px)]">
              <Outlet />
            </div>
            <Footer />
          </>
        )}
        <MobileBottomNav />
      </div>}
    </NotificationProvider>}</>
  );
};

const Root = () => <FocusSessionProvider><RootContent /></FocusSessionProvider>;

export default Root;
