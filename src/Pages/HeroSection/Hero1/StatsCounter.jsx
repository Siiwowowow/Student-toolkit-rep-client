"use client";
import React from "react";
import CountUp from "react-countup";

export default function StatsCounter() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 px-4 sm:px-0">
      {/* Students */}
      <div className="text-center p-4 rounded-lg">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-indigo-600">
          <CountUp end={500} duration={3} />+
        </p>
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-gray-500">
          Students Organized
        </p>
      </div>

      {/* Classes */}
      <div className="text-center p-4 rounded-lg">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-indigo-600">
          <CountUp end={1000} duration={3} separator="," />+
        </p>
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-gray-500">
          Classes Tracked
        </p>
      </div>

      {/* Success Rate */}
      <div className="text-center p-4 rounded-lg">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-indigo-600">
          <CountUp end={95} duration={3} />%
        </p>
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-gray-500">
          Success Rate
        </p>
      </div>
    </div>
  );
}
