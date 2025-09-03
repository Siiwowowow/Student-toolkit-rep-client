import React from "react";
import { Link } from "react-router";
import StatsCounter from "./StatsCounter";

// SVG Icons (unchanged)
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500">
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>
);

const BudgetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ExamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const PlannerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M16 2v4"></path>
    <path d="M8 2v4"></path>
    <path d="M3 10h18"></path>
  </svg>
);

const Hero1 = () => {
  return (
    <div className="bg-base-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Make Student Life{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
            Easier
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-xl sm:text-lg text-gray-500 mb-8 sm:mb-12 px-4 sm:px-0">
          Your all-in-one toolkit for managing classes, budget, exam preparation, and study planning. Stay organized and achieve academic success.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
          {/* Card 1 */}
          <Link to="/schedule">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 flex flex-col items-start text-left">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full mb-3 sm:mb-4">
              <CalendarIcon />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Class Schedule</h3>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">Track your daily classes and never miss a lecture.</p>
          </div>
          </Link>

          {/* Card 2 */}
          <Link to="/budget">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 flex flex-col items-start text-left">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full mb-3 sm:mb-4">
                <BudgetIcon />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Budget Tracker</h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">Manage your finances with income and expense tracking.</p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/exam-pep">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 flex flex-col items-start text-left">
            <div className="p-2 sm:p-3 bg-red-100 rounded-full mb-3 sm:mb-4">
              <ExamIcon />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Exam Preparation</h3>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">Generate practice questions and test your knowledge.</p>
          </div>
          </Link>

          {/* Card 4 */}
          <Link to="/study-planer">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 flex flex-col items-start text-left">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-full mb-3 sm:mb-4">
              <PlannerIcon />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Study Planner</h3>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">Break down study goals into manageable tasks.</p>
          </div>
          </Link>
        </div>

        {/* Stats */}
       <StatsCounter></StatsCounter>
      </div>
    </div>
  );
};

export default Hero1;
