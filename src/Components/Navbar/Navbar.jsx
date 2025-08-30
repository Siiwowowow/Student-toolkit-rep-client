import React from 'react';
import { Link, NavLink } from 'react-router';
import logo from '../../../public/logo.png';

const Navbar = () => {
  const nav = (
    <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
      {[
        { name: "Home", to: "/" },
        { name: "Schedule", to: "/schedule" },
        { name: "Budget", to: "/budget" },
        { name: "Exam Prep", to: "/exam-pep" },
        { name: "Study Planner", to: "/study-planer" },
      ].map((link, i) => (
        <NavLink
          key={i}
          to={link.to}
          className={({ isActive }) =>
            isActive
              ? "font-bold border-b-2 border-[#2c5364] bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] bg-clip-text text-transparent"
              : "text-gray-700 hover:text-[#2c5364]"
          }
        >
          {link.name}
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="sticky top-0 z-50 bg-base-100 shadow-md">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar Start */}
        <div className="navbar-start">
          {/* Mobile Dropdown */}
          <div className="dropdown">
            <div tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow"
            >
              {nav}
            </ul>
          </div>
          <img className="w-20" src={logo} alt="Logo" />
        </div>

        {/* Navbar Center */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">{nav}</ul>
        </div>

        {/* Navbar End */}
        <div className="navbar-end space-x-2">
          <Link className='btn'>Sign Up</Link>
          <Link className='btn'>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
