import React from "react";

const Why = () => {
  return (
    <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Image */}
        <div className="flex justify-center lg:justify-end">
          <img
            src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop"
            alt="Why Choose Us"
            className="rounded-xl shadow-2xl w-full max-w-md object-cover"
          />
        </div>

        {/* Right Side - Text */}
        <div className="text-left">
          <p className="text-indigo-600 font-semibold mb-2">Why Choose Us</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            Make Student Life Easier and More Organized
          </h2>
          <p className="text-gray-600 mb-6">
            Our all-in-one Student Life Toolkit helps you manage classes, track
            your budget, prepare for exams, and plan your study schedule
            efficiently. Designed with students in mind, it keeps you on top of
            your academic goals.
          </p>

          {/* Features List */}
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 mt-1">
                ✓
              </span>
              <span className="text-gray-700">
                Track classes and never miss a lecture.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 mt-1">
                ✓
              </span>
              <span className="text-gray-700">
                Manage your income, expenses, and savings effectively.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 mt-1">
                ✓
              </span>
              <span className="text-gray-700">
                Generate practice questions and prepare for exams.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 mt-1">
                ✓
              </span>
              <span className="text-gray-700">
                Plan your study goals with ease and stay organized.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Why;
