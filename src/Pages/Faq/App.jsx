import React, { useState } from "react";

// Single FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div
    className="border-b  border-slate-200 py-4 cursor-pointer"
    onClick={onToggle}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-base font-medium">{question}</h3>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${
          isOpen ? "rotate-180" : ""
        } transition-all duration-500 ease-in-out`}
      >
        <path
          d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
          stroke="#1D293D"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <p
      className={`text-sm text-slate-500 transition-all duration-500 ease-in-out max-w-md ${
        isOpen ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"
      }`}
    >
      {answer}
    </p>
  </div>
);

// Main FAQ Component
const FAQ = ({ data, title, subtitle, image }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-8 px-4 md:px-0">
      {image && (
        <img
          className="max-w-sm w-full rounded-xl h-full"
          src={image}
          alt="FAQ Illustration"
        />
      )}
      <div>
        <p className="text-indigo-600 text-sm font-medium">FAQ</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-2 pb-4">{subtitle}</p>}

        {data.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          />
        ))}
      </div>
    </div>
  );
};

// Example usage
const App = () => {
  const faqs = [
    {
      question: "How do I add my classes to the schedule?",
      answer:
        "Go to the Class Schedule section, fill in subject, instructor, day, and time, and click 'Add'. Classes will appear color-coded.",
    },
    {
      question: "Can I track my income and expenses?",
      answer:
        "Yes! Log your income and expenses in the Budget Tracker. Visual charts help you analyze spending.",
    },
    {
      question: "How do I practice for exams?",
      answer:
        "Select your subject and difficulty in Exam Q&A. Generate random MCQs, True/False, and short questions to practice.",
    },
    {
      question: "Can I plan my study tasks?",
      answer:
        "Yes, create tasks with subject, topic, priority, and deadline. Track progress and use the Pomodoro timer for focus.",
    },
    {
      question: "Is my data saved?",
      answer:
        "All your data is securely saved in the backend. You can log back in anytime to continue where you left off.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <FAQ
        data={faqs}
        title="Frequently Asked Questions"
        subtitle="Manage classes, budget, exams, and study plans efficiently with our Student Life Toolkit."
        image="https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop"
      />
    </>
  );
};

export default App;
