import React from "react";

// SVG Icons (unchanged)
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-500">
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>
);

const BudgetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-emerald-500">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ExamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-rose-500">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const PlannerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-amber-500">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M16 2v4"></path>
    <path d="M8 2v4"></path>
    <path d="M3 10h18"></path>
  </svg>
);

const Hero1 = () => {
  return (
    <div className="bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl mb-4">
          Make Student Life <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Easier</span>
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-gray-500 mb-12">
          Your all-in-one toolkit for managing classes, budget, exam preparation, and study planning. Stay organized and achieve academic success.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-500 p-6 flex flex-col items-start">
            <div className="p-3 bg-purple-100 rounded-full mb-4">
              <CalendarIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Class Schedule</h3>
            <p className="text-base text-gray-500">Track your daily classes and never miss a lecture.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-500 p-6 flex flex-col items-start">
            <div className="p-3 bg-green-100 rounded-full mb-4">
              <BudgetIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Budget Tracker</h3>
            <p className="text-base text-gray-500">Manage your finances with income and expense tracking.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-500 p-6 flex flex-col items-start">
            <div className="p-3 bg-red-100 rounded-full mb-4">
              <ExamIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Exam Preparation</h3>
            <p className="text-base text-gray-500">Generate practice questions and test your knowledge.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-500 p-6 flex flex-col items-start">
            <div className="p-3 bg-yellow-100 rounded-full mb-4">
              <PlannerIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Study Planner</h3>
            <p className="text-base text-gray-500">Break down study goals into manageable tasks.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-indigo-600">500+</p>
            <p className="mt-2 text-lg text-gray-500">Students Organized</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-extrabold text-indigo-600">10K+</p>
            <p className="mt-2 text-lg text-gray-500">Classes Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-extrabold text-indigo-600">95%</p>
            <p className="mt-2 text-lg text-gray-500">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero1;
