import React from "react";
import { Link } from "react-router";
import { Typewriter } from "react-simple-typewriter";
import { motion } from "framer-motion";
import StatsCounter from "./StatsCounter";
import "./Hero1.css";

// SVG Icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500">
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>
);

const BudgetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ExamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const PlannerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M16 2v4"></path>
    <path d="M8 2v4"></path>
    <path d="M3 10h18"></path>
  </svg>
);

const Hero1 = () => {
  const cardData = [
    {
      title: "Class Schedule",
      desc: "Track your daily classes and never miss a lecture.",
      icon: <CalendarIcon />,
      link: "/schedule",
    },
    {
      title: "Budget Tracker",
      desc: "Manage your finances with income and expense tracking.",
      icon: <BudgetIcon />,
      link: "/budget",
    },
    {
      title: "Exam Preparation",
      desc: "Generate practice questions and test your knowledge.",
      icon: <ExamIcon />,
      link: "/exam-pep",
    },
    {
      title: "Study Planner",
      desc: "Break down study goals into manageable tasks.",
      icon: <PlannerIcon />,
      link: "/study-planer",
    },
  ];

  return (
    <div className="bg-base-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Heading with Typewriter */}
        <h1 className="text-3xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Make Student Life{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
            <Typewriter
              words={["Easier", "Smarter", "Organized"]}
              loop
              cursor
              cursorStyle="|"
              typeSpeed={100}
              deleteSpeed={70}
              delaySpeed={1500}
            />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-xl sm:text-lg text-gray-500 mb-8 sm:mb-12 px-4 sm:px-0">
          Your all-in-one toolkit for managing classes, budget, exam preparation, and study planning. Stay organized and achieve academic success.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
  {cardData.map((card, index) => (
    <Link key={index} to={card.link}>
      <motion.div
        className="neon-card-purple shadow-lg p-6 flex flex-col items-start text-left rounded-xl"
        initial={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="p-3 bg-purple-100 rounded-full mb-4">
          {card.icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{card.desc}</p>
      </motion.div>
    </Link>
  ))}
</div>


        {/* Stats */}
        <StatsCounter />
      </div>
    </div>
  );
};

export default Hero1;
