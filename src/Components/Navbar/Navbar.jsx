import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import "../Home/Home.css";

const navigation = [
  { label: "Home", path: "/" },
  { label: "Schedule", path: "/schedule" },
  { label: "Budget", path: "/budget" },
  { label: "Study Planner", path: "/study-planner" },
  { label: "Wellness", path: "/remainder" },
];

export default function Navbar({ onSearch }) {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const startPath = user ? "/study-planner" : "/signUp";
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

  const handleSearch = () => {
    if (onSearch) onSearch();
    else navigate("/#explore-tools");
    setMenuOpen(false);
  };

  return (
    <header
      className="sh-header"
      ref={headerRef}
      onKeyDown={(event) => {
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
          <button
            type="button"
            className="sh-search-trigger"
            onClick={handleSearch}
            aria-label="Search the toolkit"
          >
            <Search size={21} />
          </button>
          {user ? (
            <div className="sh-account" ref={accountRef}>
              <button
                type="button"
                className="sh-account-button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                aria-controls="sh-account-menu"
                aria-label="Open account menu"
              >
                {avatar ? (
                  <img src={avatar} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initials}</span>
                )}
              </button>
              {accountOpen && (
                <div id="sh-account-menu" className="sh-account-menu">
                  <div>
                    <UserRound size={16} />
                    <span>
                      <strong>{user.displayName || "Student"}</strong>
                      <small>{user.email}</small>
                    </span>
                  </div>
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="sh-login" to="/logIn">
              Login
            </Link>
          )}
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
