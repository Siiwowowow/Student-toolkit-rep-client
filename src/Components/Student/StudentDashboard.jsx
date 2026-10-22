import { createElement, useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, useLocation, useNavigate } from "react-router";
import {
  Bell, BookOpen, BookOpenCheck, CalendarDays, CheckCheck, Clock3, ChevronsLeft,
  ChevronsRight, Headphones, Home, LayoutDashboard, LogOut, Megaphone, Menu, Moon, Sun, Wallet, X, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import { NotificationContext } from "../Notifications/notification-context";
import StudentOverview from "./StudentOverview";
import StudentNoticeBoard from "./StudentNoticeBoard";
import { legacyNoticeUrl, NOTICE_BOARD_PATH } from "./notice-routes.mjs";
import WeeklyFocusProgress from "./WeeklyFocusProgress";
import StudentQuizUpdates from "./StudentQuizUpdates";
import NotificationBell from "../Notifications/NotificationBell";
import "./StudentDashboard.css";

const tools = [
  { to: "/focus-study-mood", label: "Focus Study Mood", icon: Headphones },
  { to: "/study-planner", label: "Study planner", icon: CheckCheck },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/exam-prep", label: "Exam prep", icon: BookOpenCheck },
  { to: "/budget", label: "Budget", icon: Wallet },
];
const storedCollapsed = () => {
  try { return localStorage.getItem("toolkit-student-sidebar") === "collapsed"; } catch { return false; }
};

export default function StudentDashboard({ quizUpdates = false, noticeBoard = false }) {
  const { user, logOut, profile } = useContext(AuthContext);
  const feed = useContext(NotificationContext);
  const drawer = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(storedCollapsed);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const update = () => { setMobile(query.matches); setDrawerOpen(false); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (mobile && drawerOpen) {
      const dialog = drawer.current;
      dialog?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        dialog?.close();
        document.body.style.overflow = previous;
      };
    }
    drawer.current?.close();
  }, [mobile, drawerOpen]);
  useEffect(() => {
    try { localStorage.setItem("toolkit-student-sidebar", collapsed ? "collapsed" : "expanded"); } catch { /* Optional preference. */ }
  }, [collapsed]);

  const currentLabel = quizUpdates ? "Quiz updates" : noticeBoard ? "Notice board" : "Overview";
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setTheme(next);
    try { localStorage.setItem("toolkit-theme", next); } catch { /* Optional preference. */ }
  };
  const logout = async () => {
    setSigningOut(true);
    try {
      await logOut();
      toast.success("Logged out successfully!");
      navigate("/logIn", { replace: true });
    } catch {
      toast.error("Could not finish signing out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };
  const sidebar = (inDrawer = false) => <>
    <div className="std-brand-row">
      <Link to="/student-dashboard" className="std-brand" onClick={() => setDrawerOpen(false)} aria-label="Toolkit student dashboard">
        <span className="std-brand-mark"><BookOpen size={23} /></span>
        <span className="std-sidebar-label">TOOLKIT<span className="std-brand-plus">+</span><small>STUDENT WORKSPACE</small></span>
      </Link>
      {inDrawer && <button type="button" className="std-icon-button" aria-label="Close sidebar" onClick={() => setDrawerOpen(false)}><X size={20} /></button>}
    </div>
    <div className="std-sidebar-scroll">
    <div className="std-nav-caption std-sidebar-label">YOUR WORKSPACE</div>
    <nav className="std-navigation" aria-label="Student dashboard navigation">
      <Link to="/" title="Home" aria-label="Home" onClick={() => setDrawerOpen(false)}><Home size={20} /><span className="std-sidebar-label">Home</span></Link>
      <Link to="/student-dashboard" aria-label="Overview" aria-current={currentLabel === "Overview" ? "page" : undefined} title={collapsed && !inDrawer ? "Overview" : undefined} onClick={() => setDrawerOpen(false)}><LayoutDashboard size={20} /><span className="std-sidebar-label">Overview</span><i /></Link>
      <Link to={NOTICE_BOARD_PATH} aria-label="Notice board" aria-current={currentLabel === "Notice board" ? "page" : undefined} title={collapsed && !inDrawer ? "Notice board" : undefined} onClick={() => setDrawerOpen(false)}><Megaphone size={20} /><span className="std-sidebar-label">Notice board</span></Link>
      <NavLink to="/student-dashboard/quiz-updates" aria-label="Quiz updates" title={collapsed && !inDrawer ? "Quiz updates" : undefined} onClick={() => setDrawerOpen(false)}><BookOpenCheck size={20} /><span className="std-sidebar-label">Quiz updates</span></NavLink>
    </nav>
    <div className="std-nav-caption std-sidebar-label std-tools-caption">STUDY TOOLS</div>
    <nav className="std-navigation" aria-label="Study tools">
      {tools.map(({ to, label, icon }) => <NavLink key={to} to={to} aria-label={label} title={collapsed && !inDrawer ? label : undefined} onClick={() => setDrawerOpen(false)}>{createElement(icon, { size: 20 })}<span className="std-sidebar-label">{label}</span></NavLink>)}
    </nav>
    </div>
    <div className="std-sidebar-bottom">
      <div className="std-sidebar-user">
        {user?.photoURL ? <img className="std-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <span className="std-avatar" aria-hidden="true">{(user?.displayName || user?.email || "S")[0].toUpperCase()}</span>}
        <Link to="/profile" className="std-sidebar-label std-profile-link" title="View your student profile"><strong>{profile?.name || user?.displayName || "Student"}</strong><small>View student profile</small></Link>
        <button type="button" className="std-logout-button" title="Log out" aria-label={signingOut ? "Signing out" : "Log out"} disabled={signingOut} onClick={logout}><LogOut size={17} /><span className="std-sidebar-label">{signingOut ? "Signing out..." : "Log out"}</span></button>
      </div>
    </div>
  </>;

  const legacyTarget = legacyNoticeUrl(location);
  if (!quizUpdates && !noticeBoard && legacyTarget) return <Navigate to={legacyTarget} replace />;

  return <div className={`std-workspace${collapsed ? " is-collapsed" : ""}`}>
    {!mobile && <aside id="std-sidebar" className="std-sidebar">{sidebar()}</aside>}
    {mobile && <dialog ref={drawer} id="std-mobile-sidebar" className="std-mobile-drawer" aria-label="Student sidebar" onCancel={() => setDrawerOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false); }}><aside className="std-drawer-content">{sidebar(true)}</aside></dialog>}
    <div className="std-main">
      <header className="std-topbar">
        <div className="std-topbar-left">
          <button type="button" className="std-icon-button" aria-label={mobile ? "Open sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={mobile ? drawerOpen : !collapsed} aria-controls={mobile ? "std-mobile-sidebar" : "std-sidebar"} onClick={() => mobile ? setDrawerOpen(true) : setCollapsed((value) => !value)}>
            {mobile ? <Menu size={21} /> : collapsed ? <ChevronsRight size={21} /> : <ChevronsLeft size={21} />}
          </button>
          <div className="std-breadcrumb"><span>Workspace</span><span>/</span><strong>{currentLabel}</strong></div>
        </div>
        <div className="std-topbar-actions">
          <NotificationBell />
          <button type="button" className="std-icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}</button>
        </div>
      </header>
      <main className="std-content">
        {quizUpdates ? <StudentQuizUpdates /> : noticeBoard ? <div className="student-dashboard"><StudentNoticeBoard /></div> : <div className="student-dashboard">
          <section className="student-dashboard-welcome">
            <div><span><Sparkles size={15} /> YOUR SPACE TO GROW</span><h1>Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1><p>A little focus today. A little closer to your goals.</p></div>
            <div className="student-dashboard-unread"><Bell size={19} /><strong>{feed.unreadCount}</strong><small>unread updates</small></div>
          </section>
          <StudentOverview />
          <WeeklyFocusProgress key={user.uid} />
          <section className="student-dashboard-shortcuts" aria-label="Student tools">
            {tools.map(({ to, label, icon }) => <Link to={to} key={to}>{createElement(icon, { size: 20 })}<span><strong>{label}</strong><small>{label === "Study planner" ? "Plan your study tasks" : label === "Schedule" ? "View your classes" : label === "Budget" ? "Manage your budget" : "Practice your quizzes"}</small></span></Link>)}
          </section>
          <footer className="student-dashboard-updated"><Clock3 size={14} /> Your progress refreshes automatically while you are online.</footer>
        </div>}
      </main>
    </div>
  </div>;
}
