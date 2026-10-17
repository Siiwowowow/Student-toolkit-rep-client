import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { BookOpenCheck, ChevronsLeft, ChevronsRight, Home, LayoutDashboard, LogOut, Megaphone, Menu, Moon, ShieldCheck, Sun, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import "./AdminDashboard.css";

const sections = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/students", label: "Student Management", icon: Users },
  { to: "/admin/quizzes", label: "Quiz Update", icon: BookOpenCheck },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
];
const storedCollapsed = () => { try { return localStorage.getItem("toolkit-admin-sidebar") === "collapsed"; } catch { return false; } };

export default function AdminDashboard() {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(storedCollapsed);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  const drawer = useRef(null);
  const current = sections.find((section) => section.to === location.pathname) || sections[0];

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
      return () => { dialog?.close(); document.body.style.overflow = previous; };
    }
    drawer.current?.close();
  }, [mobile, drawerOpen]);
  useEffect(() => { try { localStorage.setItem("toolkit-admin-sidebar", collapsed ? "collapsed" : "expanded"); } catch { /* Optional preference. */ } }, [collapsed]);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setTheme(next);
    try { localStorage.setItem("toolkit-theme", next); } catch { /* Optional preference. */ }
  };
  const logout = async () => {
    setSigningOut(true);
    try { await logOut(); toast.success("Logged out successfully!"); navigate("/logIn", { replace: true }); }
    catch { toast.error("Could not finish signing out. Please try again."); }
    finally { setSigningOut(false); }
  };
  const sidebar = (inDrawer = false) => <>
    <div className="adm-brand-row"><Link to="/admin" className="adm-brand" onClick={() => setDrawerOpen(false)} aria-label="Toolkit administration"><span className="adm-brand-mark"><ShieldCheck size={25} /></span><span className="adm-sidebar-label">TOOLKIT<span className="adm-brand-plus">+</span><small>ADMIN WORKSPACE</small></span></Link>{inDrawer && <button type="button" className="adm-icon-button" aria-label="Close sidebar" onClick={() => setDrawerOpen(false)}><X size={21} /></button>}</div>
    <div className="adm-sidebar-scroll"><div className="adm-nav-caption adm-sidebar-label">MANAGE YOUR TOOLKIT</div>
    <nav className="adm-navigation" aria-label="Admin navigation"><Link to="/" title="Home" aria-label="Home" onClick={() => setDrawerOpen(false)}><Home size={21} /><span className="adm-sidebar-label">Home</span></Link>{sections.map(({ to, label, icon }) => {
      const Icon = icon;
      return <NavLink key={to} to={to} end title={collapsed && !inDrawer ? label : undefined} aria-label={label} onClick={() => setDrawerOpen(false)}><Icon size={21} /><span className="adm-sidebar-label">{label}</span><span className="adm-active-dot" /></NavLink>;
    })}</nav></div>
    <div className="adm-sidebar-bottom"><div className="adm-sidebar-user"><span className="adm-avatar" aria-hidden="true">{(user.displayName || user.email || "A")[0].toUpperCase()}</span><div className="adm-sidebar-label"><strong>{user.displayName || "Administrator"}</strong><small>Administrator</small></div><button type="button" className="adm-logout-button" title="Log out" aria-label={signingOut ? "Signing out" : "Log out"} disabled={signingOut} onClick={logout}><LogOut size={17} /><span className="adm-sidebar-label">{signingOut ? "Signing out..." : "Log out"}</span></button></div></div>
  </>;
  return <div className={`adm-workspace${collapsed ? " is-collapsed" : ""}`}>
    {!mobile && <aside id="adm-sidebar" className="adm-sidebar">{sidebar()}</aside>}
    {mobile && <dialog ref={drawer} id="adm-mobile-sidebar" className="adm-mobile-drawer" aria-label="Admin sidebar" onCancel={() => setDrawerOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false); }}><aside className="adm-drawer-content">{sidebar(true)}</aside></dialog>}
    <div className="adm-main"><header className="adm-topbar"><div className="adm-topbar-left"><button type="button" className="adm-icon-button" aria-label={mobile ? "Open sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={mobile ? drawerOpen : !collapsed} aria-controls={mobile ? "adm-mobile-sidebar" : "adm-sidebar"} onClick={() => mobile ? setDrawerOpen(true) : setCollapsed((value) => !value)}>{mobile ? <Menu size={21} /> : collapsed ? <ChevronsRight size={21} /> : <ChevronsLeft size={21} />}</button><div className="adm-breadcrumb"><span>Workspace</span><span>/</span><strong>{current.label}</strong></div></div><div className="adm-topbar-actions"><span className="adm-verified"><span />Admin access</span><button type="button" className="adm-icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}</button></div></header><main className="adm-content"><Outlet /></main></div>
  </div>;
}
