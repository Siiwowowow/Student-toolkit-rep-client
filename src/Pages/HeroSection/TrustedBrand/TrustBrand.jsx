import React from "react";

const TrustBrand = () => {
  const advantages = [
    "Easy Class Scheduling",
    "Budget Management",
    "Exam Preparation",
    "Study Planner",
    "Track Your Progress",
    "Save Time & Effort",
    "Organized Academic Life",
  ];

  return (
    <div className="py-2 border bg-base-200 border-gray-100">
      {/* Custom styles for marquee animation */}
      <style>{`
        .marquee-inner {
          display: flex;
          animation: marqueeScroll 20s linear infinite;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="overflow-hidden bg-base-200 w-full relative max-w-7xl mx-auto select-none h-10 sm:h-12 lg:h-16">
        {/* Left Gradient */}
        <div className="absolute left-0 top-0 h-full w-16 sm:w-24 lg:w-32 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />

        {/* Marquee Inner */}
        <div className="marquee-inner min-w-[200%] flex  items-center text-center">
          {[...advantages, ...advantages].map((text, index) => (
            <div
              key={index}
              className="mx-4 sm:mx-8 lg:mx-12 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mt-4 text-gray-700 whitespace-nowrap "
            >
              {text}
            </div>
          ))}
        </div>

        {/* Right Gradient */}
        <div className="absolute right-0 top-0 h-full w-16 sm:w-24 lg:w-32 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
};

export default TrustBrand;
