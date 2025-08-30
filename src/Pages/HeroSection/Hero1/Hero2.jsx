import React from "react";

const Hero2 = () => {
  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      {/* Heading + Intro */}
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <div>
          <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-blue-900 uppercase rounded-full bg-blue-100">
            Why Choose Us
          </p>
        </div>
        <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
          Empowering Businesses with{" "}
          <span className="text-blue-600">Data-Driven Solutions</span>
        </h2>
        <p className="text-base text-gray-700 md:text-lg">
          We help companies scale faster with innovative strategies, proven
          results, and expert guidance. Your success is our mission.
        </p>
      </div>

      {/* Stats Section */}
      <div className="relative w-full p-px mx-auto mb-4 overflow-hidden transition-shadow duration-300 border rounded-lg lg:mb-8 lg:max-w-4xl group hover:shadow-xl">
        <div className="relative flex flex-col items-center h-full py-10 duration-300 bg-white rounded-md transition-color sm:items-stretch sm:flex-row">
          {/* Stat 1 */}
          <div className="px-12 py-8 text-center">
            <h6 className="text-4xl font-bold text-blue-600 sm:text-5xl">
              95%
            </h6>
            <p className="text-center md:text-base text-gray-600">
              Client satisfaction rate achieved through tailored solutions.
            </p>
          </div>

          {/* Divider */}
          <div className="w-56 h-1 transition duration-300 transform bg-gray-200 rounded-full group-hover:bg-blue-500 group-hover:scale-110 sm:h-auto sm:w-1" />

          {/* Stat 2 */}
          <div className="px-12 py-8 text-center">
            <h6 className="text-4xl font-bold text-blue-600 sm:text-5xl">
              120K+
            </h6>
            <p className="text-center md:text-base text-gray-600">
              Active users growing their business with our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Closing Note */}
      <p className="mx-auto mb-4 text-gray-600 sm:text-center lg:max-w-2xl lg:mb-6 md:px-16">
        Join thousands of brands who trust us to deliver innovation, efficiency,
        and measurable growth.
      </p>
    </div>
  );
};

export default Hero2;
