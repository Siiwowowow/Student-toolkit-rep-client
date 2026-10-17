import { createElement, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import {
  Bell, BookOpen, BookOpenCheck, CalendarDays, CheckCheck, Clock3, ChevronsLeft,
  ChevronsRight, Home, LayoutDashboard, LogOut, Megaphone, Menu, Moon, Sun, Wallet, X, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import { NotificationContext } from "../Notifications/notification-context";
import StudentOverview from "./StudentOverview";
import StudentQuizUpdates from "./StudentQuizUpdates";
import NotificationBell from "../Notifications/NotificationBell";
import "./StudentDashboard.css";

const tools = [
  { to: "/study-planner", label: "Study planner", icon: CheckCheck },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/exam-prep", label: "Exam prep", icon: BookOpenCheck },
  { to: "/ai-planner", label: "AI assistant", icon: Sparkles },
  { to: "/budget", label: "Budget", icon: Wallet },
];
const shortDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
};
const storedCollapsed = () => {
  try { return localStorage.getItem("toolkit-student-sidebar") === "collapsed"; } catch { return false; }
};

export default function StudentDashboard({ quizUpdates = false }) {
  const { user, logOut, profile } = useContext(AuthContext);
  const feed = useContext(NotificationContext);
  const notices = feed.announcementFeed;
  const markRead = notices.markRead;
  const readAttempted = useRef(null);
  const drawer = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedId = useMemo(() => new URLSearchParams(location.search).get("announcement"), [location.search]);
  const announcements = useMemo(
    () => [...feed.announcements].sort((left, right) => new Date(right.publishedAt || right.updatedAt || 0) - new Date(left.publishedAt || left.updatedAt || 0)),
    [feed.announcements],
  );
  const [collapsed, setCollapsed] = useState(storedCollapsed);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [noticeFilter, setNoticeFilter] = useState("all");
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
  useEffect(() => {
    if (!selectedId) {
      readAttempted.current = null;
      return;
    }
    const selectedNotice = announcements.find((item) => item.id === selectedId);
    if (!selectedNotice) return;
    document.getElementById(`notice-${selectedId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const readKey = `${user?.uid || ""}:${selectedId}:${selectedNotice.publishedAt || selectedNotice.updatedAt || ""}`;
    if (readAttempted.current !== readKey) {
      readAttempted.current = readKey;
      markRead(selectedId);
    }
  }, [announcements, markRead, selectedId, user?.uid]);

  const currentLabel = quizUpdates ? "Quiz updates" : location.hash === "#notice-board" || selectedId ? "Notice board" : "Overview";
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
      <Link to="/student-dashboard#notice-board" aria-label="Notice board" aria-current={currentLabel === "Notice board" ? "page" : undefined} title={collapsed && !inDrawer ? "Notice board" : undefined} onClick={() => setDrawerOpen(false)}><Megaphone size={20} /><span className="std-sidebar-label">Notice board</span></Link>
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
        {quizUpdates ? <StudentQuizUpdates /> : <div className="student-dashboard">
          <section className="student-dashboard-welcome">
            <div><span><Sparkles size={15} /> YOUR SPACE TO GROW</span><h1>Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1><p>A little focus today. A little closer to your goals.</p></div>
            <div className="student-dashboard-unread"><Bell size={19} /><strong>{feed.unreadCount}</strong><small>unread updates</small></div>
          </section>
          <StudentOverview />
          <section className="student-dashboard-shortcuts" aria-label="Student tools">
            {tools.map(({ to, label, icon }) => <Link to={to} key={to}>{createElement(icon, { size: 20 })}<span><strong>{label}</strong><small>{label === "Study planner" ? "Plan your study tasks" : label === "Schedule" ? "View your classes" : label === "Budget" ? "Manage your budget" : label === "AI assistant" ? "Get study guidance" : "Practice your quizzes"}</small></span></Link>)}
          </section>
          <section className="student-notice-board" id="notice-board" aria-labelledby="student-notice-title">
            <header><div><span><Megaphone size={17} /> TOOLKIT COMMUNITY</span><h2 id="student-notice-title">Notice board</h2><p>Announcements from your administrator, newest first.</p></div><span className="student-notice-count">{announcements.length} {announcements.length === 1 ? "notice" : "notices"}</span></header>
            <div className="std-notice-toolbar"><div role="group" aria-label="Filter notices">{["all", "unread", "important"].map((filter) => <button key={filter} aria-pressed={noticeFilter === filter} onClick={() => setNoticeFilter(filter)}>{filter === "all" ? "All updates" : filter === "unread" ? `Unread (${notices.unreadCount})` : "Important"}</button>)}</div><button disabled={!notices.unreadCount} onClick={notices.markAllRead}><CheckCheck size={14} /> Mark all read</button></div>
            {notices.loading && <div className="student-notice-state" role="status"><span className="loading loading-spinner" />Loading notices...</div>}
            {notices.error && <div className="student-notice-error" role="alert"><p>{notices.error}</p><button type="button" onClick={notices.retry}>Try again</button></div>}
            {!notices.loading && !notices.error && !announcements.length && <div className="student-notice-state"><Bell size={29} /><strong>No announcements yet</strong><span>New notices will appear here.</span></div>}
            {!!announcements.length && <div className="student-notice-list">{announcements.filter((item) => item.id === selectedId || noticeFilter === "all" || noticeFilter === "unread" && !item.read && !item.dismissed || noticeFilter === "important" && item.priority === "important").map((item) => <article key={item.id} id={`notice-${item.id}`} className={`student-notice-card${item.id === selectedId ? " is-selected" : ""}${item.read ? " is-read" : " is-unread"}`}><button type="button" className="student-notice-open" onClick={() => navigate(`/student-dashboard?announcement=${encodeURIComponent(item.id)}#notice-board`)} aria-expanded={item.id === selectedId}><span className="student-notice-meta"><time dateTime={item.publishedAt || item.updatedAt}>{shortDate(item.publishedAt || item.updatedAt)}</time>{item.priority === "important" && <span className="student-notice-important">Important</span>}{!item.read && <span className="student-notice-new">New</span>}</span><strong>{item.title}</strong><span className="student-notice-body">{item.body}</span></button></article>)}</div>}
            {!!announcements.length && !announcements.some((item) => item.id === selectedId || noticeFilter === "all" || noticeFilter === "unread" && !item.read && !item.dismissed || noticeFilter === "important" && item.priority === "important") && <p className="std-empty">No notices in this view. You are up to date.</p>}
            {selectedId && !announcements.some((item) => item.id === selectedId) && !notices.loading && <p className="student-notice-missing">This announcement is no longer available.</p>}
          </section>
          <footer className="student-dashboard-updated"><Clock3 size={14} /> Notices refresh automatically while you are online.</footer>
        </div>}
      </main>
    </div>
  </div>;
}
