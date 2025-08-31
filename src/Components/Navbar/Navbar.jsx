import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import logo from "../../../public/logo.png";
import { AuthContext } from "../../Context/AuthContext";
import { FiLogOut, FiMail, FiUser, FiMenu, FiSettings, FiBook } from "react-icons/fi";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigationItems = [
    { name: "Home", to: "/" },
    { name: "Schedule", to: "/schedule" },
    { name: "Budget", to: "/budget" },
    { name: "Exam Prep", to: "/exam-pep" },
    { name: "Study Planner", to: "/study-planer" },
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      setAvatarOpen(false);
      toast.success('Logged out successfully!');
      navigate('/logIn'); // Navigate to login page after logout
    } catch (error) {
      console.error("Logout Error:", error.message);
      toast.error('Logout failed. Please try again.');
    }
  };

  const getAvatar = () => {
    if (user?.photoURL) return user.photoURL; // Google login
    if (user?.profileImage) return user.profileImage; // Uploaded image
    if (user?.displayName) {
      const initials = user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("");
      return `https://ui-avatars.com/api/?name=${initials}&background=0f2027&color=fff`;
    }
    return "https://ui-avatars.com/api/?name=User&background=0f2027&color=fff";
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button and logo */}
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <FiMenu className="h-5 w-5" />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-white rounded-box w-52 space-y-2"
            >
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive
                        ? "text-white bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364]"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                    onClick={() => document.activeElement?.blur()}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/" className="flex items-center">
            <img className="w-30 h-20" src={logo} alt="Study Planner Logo" />
            
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 space-x-1">
            {navigationItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? "text-white bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364]"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User actions */}
        <div className="navbar-end relative">
          {user ? (
            <div ref={dropdownRef}>
              {/* Avatar Button */}
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="btn btn-ghost btn-circle avatar mx-2"
              >
                <div className="w-10 rounded-full">
                  <img
                    src={getAvatar()}
                    alt="User Avatar"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=User&background=0f2027&color=fff";
                    }}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {avatarOpen && (
                <ul className="absolute -right-15 mt-2 w-64 bg-white rounded-md shadow-lg p-2 border border-gray-200 z-50">
                  {/* User Info */}
                  <li className="border-b border-gray-100 mb-1">
                    <div className="flex items-center gap-3 px-2 py-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full border flex items-center justify-center">
                          <img 
                            src={getAvatar()} 
                            alt="User" 
                            onError={(e) => {
                              e.target.src = "https://ui-avatars.com/api/?name=User&background=0f2027&color=fff";
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || "User"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </li>
                  
                  {/* Additional Menu Items */}
                  <li>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-md"
                      onClick={() => setAvatarOpen(false)}
                    >
                      <FiUser className="h-4 w-4" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-md"
                      onClick={() => setAvatarOpen(false)}
                    >
                      <FiSettings className="h-4 w-4" />
                      Settings
                    </Link>
                  </li>
                  
                  {/* Logout Button */}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left hover:bg-gray-100 text-red-500 py-2 px-4 rounded-md"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/logIn"
                className="btn btn-ghost text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full mr-2"
              >
                Sign In
              </Link>
              <Link
                to="/signUp"
                className="btn bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white hover:opacity-90 rounded-full"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;