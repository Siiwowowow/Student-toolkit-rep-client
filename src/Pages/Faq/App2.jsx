import React, { useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../Context/AuthContext";
import "./App2.css"; // Import CSS for animation

export default function App2() {
  const { user } = useContext(AuthContext);
  return (
    <div className="bg-base-200">
      <div className="w-full sm:w-11/12 mb-5 sm:mx-auto rounded-2xl">
        <div className="animated-bg flex flex-col items-center justify-center text-center py-10 sm:py-12 md:py-16 rounded-[15px] shadow-lg">
          
          {/* Trusted Badge */}
          <div className="flex items-center justify-center bg-white px-3 py-1.5 shadow gap-2 rounded-full text-xs sm:text-sm mb-4">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* SVG paths */}
            </svg>
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent font-medium">
              Trusted by 10,000+ Students
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mt-2 leading-snug">
            Organize Your Studies with <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Smart Tools
            </span>{" "}
            & Stay Ahead!
          </h2>

          {/* Description */}
          <p className="text-slate-600 mt-4 max-w-lg text-sm sm:text-base md:text-lg">
            From class scheduling to exam preparation, our Student Life Toolkit 
            helps you save time, reduce stress, and achieve academic success with ease.
          </p>

          {/* CTA Button */}
          {!user ? (
            <Link to="/signup">
              <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm px-6 py-2.5 rounded-xl font-medium mt-6 hover:scale-105 active:scale-95 transition-all duration-300">
                Get Started Today
              </button>
            </Link>
          ) : (
            <Link to="/schedule">
              <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm px-6 py-2.5 rounded-xl font-medium mt-6 hover:scale-105 active:scale-95 transition-all duration-300">
                👋 Explore Now
              </button>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}
