import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import logo from "../../../public/logo.png";
import { AuthContext } from "../../Context/AuthContext";
import toast from "react-hot-toast";

// Icons
import { 
  FiLogOut, 
  FiUser, 
  FiMenu, 
  FiSettings 
} from "react-icons/fi";
import { 
  AiOutlineHome, 
  AiOutlineCalendar, 
  AiOutlineDollarCircle, 
  AiOutlineSchedule 
} from "react-icons/ai";
import { 
  MdOutlineSchool, 
  MdOutlinePsychology, 
  MdOutlineAssistant 
} from "react-icons/md";

const Navbar = () => {
  // Context and state
  const { user, logOut } = useContext(AuthContext);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Navigation items configuration
  const navigationItems = [
    { name: "Home", to: "/", icon: <AiOutlineHome  /> },
    { name: "Schedule", to: "/schedule", icon: <AiOutlineCalendar  /> },
    { name: "Budget", to: "/budget", icon: <AiOutlineDollarCircle  /> },
    { name: "Study Planner", to: "/study-planner", icon: <AiOutlineSchedule  /> },
    { name: "Exam Prep", to: "/exam-prep", icon: <MdOutlineSchool  /> },
    { name: "Wellness Hub", to: "/remainder", icon: <MdOutlinePsychology  /> },
    { name: "Personal Assistant", to: "/ai-planner", icon: <MdOutlineAssistant  /> },
  ];

  // Effect for handling clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logOut();
      setAvatarOpen(false);
      toast.success("Logged out successfully!");
      navigate("/logIn");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.log(error);
    }
  };

  // Get user avatar
  const getAvatar = () => {
    if (user?.photoURL) return user.photoURL;
    if (user?.profileImage) return user.profileImage;
    if (user?.displayName) {
      const initials = user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("");
      return `https://ui-avatars.com/api/?name=${initials}&background=0f2027&color=fff`;
    }
    return "https://ui-avatars.com/api/?name=User&background=0f2027&color=fff";
  };

  // Render navigation items
  const renderNavItems = (isMobile = false) => {
    return navigationItems.map((item, index) => (
      <li key={index}>
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            isActive
              ? `text-white bg-gradient-to-r from-purple-${isMobile ? '600' : '500'} to-${isMobile ? 'blue-500' : 'indigo-500'} rounded-md px-${isMobile ? '2' : '3'} py-1 flex items-center`
              : `text-gray-700 hover:bg-gray-100 rounded-md px-${isMobile ? '2' : '3'} py-1 flex items-center`
          }
          onClick={() => isMobile && document.activeElement?.blur()}
        >
          {item.icon} {item.name}
        </NavLink>
      </li>
    ));
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Navigation */}
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <FiMenu className="h-6 w-6" />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-3 shadow bg-white rounded-box w-56 space-y-2"
            >
              <li className="flex justify-center border-b pb-2 mb-2">
                <Link to="/" onClick={() => document.activeElement?.blur()}>
                  <img src={logo} alt="Logo" className="w-20 mx-auto" />
                </Link>
              </li>
              {renderNavItems(true)}
            </ul>
          </div>

          {/* Desktop Logo */}
          <Link to="/" className="hidden lg:block">
            <img className="w-26" src={logo} alt="Study Planner Logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal">
            {renderNavItems()}
          </ul>
        </div>

        {/* User Actions */}
        <div className="navbar-end relative">
          {user ? (
            <div ref={dropdownRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="btn btn-ghost border border-gray-500 btn-circle avatar mx-2"
              >
                <div className="w-10 rounded-full">
                  <img
                    src={getAvatar()}
                    alt="User Avatar"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </button>

              {avatarOpen && (
                <ul className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-2 border border-gray-200 z-50">
                  <li className="border-b border-gray-100 mb-1">
                    <div className="flex items-center gap-3 px-2 py-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full border">
                          <img src={getAvatar()} alt="User" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.displayName || "User"}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left hover:bg-gray-100 text-red-500 py-2 px-4 rounded-md"
                    >
                      <FiLogOut className="h-4 w-4" /> Log Out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/logIn"
                className="btn btn-ghost text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full flex items-center gap-1"
              >
                <FiUser /> Sign In
              </Link>
              <Link
                to="/signUp"
                className="btn bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 rounded-full flex items-center gap-1"
              >
                <FiSettings /> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;