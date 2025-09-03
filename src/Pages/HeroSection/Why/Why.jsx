import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const Why = () => {
  return (
    <div className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left Side - Image */}
        <div className="flex justify-center md:justify-end">
          <img
            src="https://images.unsplash.com/photo-1560452895-7d709050768f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
            alt="Why Choose Us"
            className="rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg object-cover"
          />
        </div>

        {/* Right Side - Text */}
        <div className="text-left">
          <p className="text-indigo-600 font-semibold mb-2 text-sm sm:text-base">
            Why Choose Us
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-snug">
            Make Student Life Easier and More Organized
          </h2>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Our all-in-one <span className="font-medium">Student Life Toolkit</span> 
            helps you manage classes, track your budget, prepare for exams, and 
            plan your study schedule efficiently. Designed with students in mind, 
            it keeps you on top of your academic goals.
          </p>

          {/* Features List */}
          <ul className="space-y-4">
            <li className="flex items-start">
              <FaCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
              <span className="text-gray-700 text-sm sm:text-base">
                Track classes and never miss a lecture.
              </span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
              <span className="text-gray-700 text-sm sm:text-base">
                Manage your income, expenses, and savings effectively.
              </span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
              <span className="text-gray-700 text-sm sm:text-base">
                Generate practice questions and prepare for exams.
              </span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
              <span className="text-gray-700 text-sm sm:text-base">
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
