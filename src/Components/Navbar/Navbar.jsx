import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  LogOut,
  Menu,
  Bell,
  LayoutDashboard,
  Moon,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import "../Home/Home.css";

import { navigation } from "./navigation";
import NotificationInbox from "../Notifications/NotificationInbox";
import { NotificationContext } from "../Notifications/notification-context";

export default function Navbar() {
  const { user, logOut, role, profile } = useContext(AuthContext);
  const notificationFeed = useContext(NotificationContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  const notificationsRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const accountRef = useRef(null);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const startPath = role === "admin" ? "/admin" : user ? "/study-planner" : "/signUp";
  const avatar = user?.photoURL || user?.profileImage;
  const initials = (user?.displayName || user?.email || "S")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const closeOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target))
        setNotificationsOpen(false);
      if (accountRef.current && !accountRef.current.contains(event.target))
        setAccountOpen(false);
      if (headerRef.current && !headerRef.current.contains(event.target))
        setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      setAccountOpen(false);
      setMenuOpen(false);
      toast.success("Logged out successfully!");
      navigate("/logIn");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("toolkit-theme", theme);
    } catch { /* The toggle still works when storage is unavailable. */ }
  }, [theme]);

  return (
    <header
      className="sh-header"
      ref={headerRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && notificationsOpen) {
          setNotificationsOpen(false);
          notificationButtonRef.current?.focus();
        }
        if (event.key === "Escape" && accountOpen) {
          setAccountOpen(false);
          accountRef.current?.querySelector("button")?.focus();
        }
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div className="sh-shell sh-nav">
        <Link
          to="/"
          className="sh-logo"
          aria-label="Student Toolkit home"
          onClick={() => setMenuOpen(false)}
        >
          TOOLKIT<span>+</span>
          <small>Plan · Study · Grow · Repeat</small>
        </Link>
        <nav className="sh-desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              to={item.path}
              end
              key={item.path}
              className={({ isActive }) =>
                isActive ? "sh-current" : undefined
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sh-nav-actions">
          {user && <NavLink to={role === "admin" ? "/admin" : "/student-dashboard"} className={({ isActive }) => `sh-icon-button sh-dashboard-icon${isActive ? " is-active" : ""}`} aria-label={role === "admin" ? "Admin dashboard" : "Student dashboard"} title={role === "admin" ? "Admin dashboard" : "Student dashboard"}><LayoutDashboard size={21} /></NavLink>}
          {role === "student" && <div className="sh-notifications" ref={notificationsRef}>
            <button
              type="button"
              className="sh-icon-button"
              ref={notificationButtonRef}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setAccountOpen(false);
              }}
              aria-label={notificationFeed.unreadCount ? `Notifications, ${notificationFeed.unreadCount} unread` : "Notifications"}
              aria-expanded={notificationsOpen}
              aria-controls="sh-notification-panel"
              title={notificationFeed.unreadCount ? `${notificationFeed.unreadCount} unread notifications` : "Notifications"}
            >
              <Bell size={21} />
              {notificationFeed.unreadCount > 0 && <span className="sh-notification-count">{notificationFeed.unreadCount > 99 ? "99+" : notificationFeed.unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <section id="sh-notification-panel" className="sh-notification-panel" aria-label="Notifications">
                <div className="sh-notification-heading">
                  <strong>Notifications</strong>
                  <div className="sh-notification-heading-actions">{notificationFeed.unreadCount > 0 && <button type="button" className="sh-notification-mark-all" onClick={notificationFeed.markAllRead}>Mark all read</button>}<button type="button" className="sh-icon-button" aria-label="Close notifications" onClick={() => {
                    setNotificationsOpen(false);
                    notificationButtonRef.current?.focus();
                  }}><X size={17} /></button></div>
                </div>
                <NotificationInbox user={user} feed={notificationFeed} onNavigate={() => setNotificationsOpen(false)} />
              </section>
            )}
          </div>}
          <button
            type="button"
            className="sh-icon-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={21} /> : <Moon size={21} />}
          </button>
          <div className={`sh-account${user ? "" : " sh-account-guest"}`} ref={accountRef}>
            <button
              type="button"
              className="sh-account-button"
              onClick={() => {
                setAccountOpen(!accountOpen);
                setNotificationsOpen(false);
                setMenuOpen(false);
              }}
              aria-expanded={accountOpen}
              aria-controls="sh-account-menu"
              aria-label="Open account menu"
            >
              {avatar ? (
                <img src={avatar} alt="" referrerPolicy="no-referrer" />
              ) : user ? (
                <span>{initials}</span>
              ) : (
                <UserRound size={20} aria-hidden="true" />
              )}
            </button>
            {accountOpen && (
              <div id="sh-account-menu" className="sh-account-menu">
                <div>
                  <UserRound size={16} aria-hidden="true" />
                  <span>
                    <strong>{profile?.name || user?.displayName || (user ? "Student" : "Welcome to TOOLKIT+")}</strong>
                    <small>{user?.email || "Sign in to start planning"}</small>
                  </span>
                </div>
                {user && role === "student" && <NavLink to="/profile" onClick={() => setAccountOpen(false)} className={({ isActive }) => `sh-account-profile${isActive ? " sh-account-current" : ""}`}><UserRound size={16} aria-hidden="true" />Profile</NavLink>}
                <nav className="sh-account-routes" aria-label="Account navigation">
                  {user && (
                    <NavLink to={role === "admin" ? "/admin" : "/student-dashboard"} onClick={() => setAccountOpen(false)} className={({ isActive }) => isActive ? "sh-account-current" : undefined}>
                      {role === "admin" ? "Admin Dashboard" : "Student Dashboard"}<ArrowUpRight size={16} aria-hidden="true" />
                    </NavLink>
                  )}
                  {navigation.map((item) => (
                    <NavLink
                      to={item.path}
                      end
                      key={item.path}
                      onClick={() => setAccountOpen(false)}
                      className={({ isActive }) => isActive ? "sh-account-current" : undefined}
                    >
                      {item.label}<ArrowUpRight size={16} aria-hidden="true" />
                    </NavLink>
                  ))}
                </nav>
                <Link className="sh-account-start" to={startPath} onClick={() => setAccountOpen(false)}>
                  {user ? "My Planner" : "Get Started"}<ArrowRight size={15} aria-hidden="true" />
                </Link>
                {user ? (
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={16} /> Log out
                  </button>
                ) : (
                  <Link className="sh-account-login" to="/logIn" onClick={() => setAccountOpen(false)}>
                    <UserRound size={16} aria-hidden="true" /> Login
                  </Link>
                )}
              </div>
            )}
          </div>
          {!user && <Link className="sh-login" to="/logIn">Login</Link>}
          <Link className="sh-button" to={startPath}>
            {user ? "My Planner" : "Get Started"}
            <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            className="sh-menu-button"
            ref={menuButtonRef}
            aria-expanded={menuOpen}
            aria-controls="sh-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav
        id="sh-mobile-nav"
        className="sh-mobile-nav"
        hidden={!menuOpen}
        aria-label="Mobile navigation"
      >
        {navigation.map((item) => (
          <NavLink
            to={item.path}
            end
            key={item.path}
            onClick={() => setMenuOpen(false)}
            className="sh-mobile-route"
          >
            {item.label}
            <ArrowUpRight size={16} />
          </NavLink>
        ))}
        <Link
          className="sh-button sh-mobile-cta"
          to={startPath}
          onClick={() => setMenuOpen(false)}
        >
          {user ? "My Planner" : "Get Started"}
          <ArrowRight size={15} />
        </Link>
        {user ? (
          <button type="button" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        ) : (
          <Link to="/logIn" onClick={() => setMenuOpen(false)}>
            Login <ArrowUpRight size={16} />
          </Link>
        )}
      </nav>
    </header>
  );
}
