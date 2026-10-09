import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  Coins,
  FileText,
  HeartPulse,
  Plus,
  Search,
  Smile,
  X,
} from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import Hero1 from "../../Pages/HeroSection/Hero1/Hero1";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import StatsBand from "./StatsBand";
import LandingCanvas from "./LandingCanvas";
import "./Home.css";

const tools = [
  {
    title: "Class Schedule",
    short: "Schedule",
    path: "/schedule",
    icon: CalendarDays,
    color: "purple",
    description: "Organize your classes and never miss a thing.",
    detail:
      "Add your classes, search subjects, and filter your weekly timetable by day.",
    image: 0,
  },
  {
    title: "Budget Tracker",
    short: "Budget",
    path: "/budget",
    icon: Coins,
    color: "yellow",
    description: "Track your income, expenses, and savings.",
    detail:
      "Manage transactions, check your balance, and understand spending with monthly trends.",
    image: 1,
  },
  {
    title: "Study Planner",
    short: "Study Planner",
    path: "/study-planner",
    icon: BookOpen,
    color: "orange",
    description: "Plan your study tasks and stay productive.",
    detail:
      "Set priorities and deadlines, complete study tasks, and follow your progress.",
    image: 2,
  },
  {
    title: "Exam Preparation",
    short: "Exam Prep",
    path: "/exam-prep",
    icon: FileText,
    color: "blue",
    description: "Practice questions, quizzes, and review.",
    detail:
      "Choose a subject and difficulty, take timed quizzes, and build your vocabulary.",
    image: 3,
  },
  {
    title: "Wellness Hub",
    short: "Wellness",
    path: "/remainder",
    icon: HeartPulse,
    color: "pink",
    description: "Track your mood, habits, and a healthier you.",
    detail:
      "Check in with your mood, track water and habits, and take a focused study break.",
    image: 4,
  },
  {
    title: "AI Assistant",
    short: "AI Assistant",
    path: "/ai-planner",
    icon: Bot,
    color: "green",
    description: "Get fresh ideas, suggestions, and guidance.",
    detail:
      "Ask questions, explore explanations, and find a starting point for your next study session.",
    image: 5,
  },
];
const routines = [
  {
    label: "BEFORE THE FIRST CLASS",
    title: "Start with a plan.",
    text: "Check your timetable, pick one priority, and give your day a little direction.",
    icon: CalendarDays,
    path: "/schedule",
    action: "Plan your day",
    color: "blue",
  },
  {
    label: "WHEN IT’S TIME TO FOCUS",
    title: "Find your flow.",
    text: "Break a big topic into small tasks. Practice what you know, then keep going.",
    icon: BookOpen,
    path: "/study-planner",
    action: "Find your next task",
    color: "orange",
  },
  {
    label: "SOMEWHERE IN BETWEEN",
    title: "Make room for you.",
    text: "Drink some water, check in with yourself, and remember that a break counts, too.",
    icon: HeartPulse,
    path: "/remainder",
    action: "Take a breather",
    color: "green",
  },
];
const faqs = [
  [
    "Is TOOLKIT+ really free?",
    "You can explore the available tools without a payment step. Class Schedule, Budget Tracker, and Study Planner ask you to sign in.",
  ],
  [
    "Do I need to create an account?",
    "Sign in with email or Google for Class Schedule, Budget Tracker, and Study Planner. Exam Preparation, Wellness Hub, and the AI Assistant can be opened without an account.",
  ],
  [
    "Can I use it on mobile?",
    "Yes. Open the website in your mobile browser to use your tools. The landing page adapts to phones, tablets, and desktop screens.",
  ],
  [
    "Is my data safe?",
    "Sign-in uses Firebase authentication. Schedules, budgets, and study tasks use the connected backend; wellness check-ins currently reset when you reload the page.",
  ],
  [
    "Can I suggest new features?",
    "We welcome ideas. A dedicated suggestion form is not available on the site yet.",
  ],
];
const testimonials = [
  {
    quote:
      "This app literally organizes my entire student life. I love the study planner and budget tracker!",
    name: "Sarah Khan",
    role: "University Student",
    avatar: 0,
  },
  {
    quote:
      "The exam prep and AI assistant are game-changers. Everything I need in one place.",
    name: "Rafi Ahmed",
    role: "College Student",
    avatar: 1,
  },
  {
    quote:
      "The wellness tracker helps me stay focused and healthy. Highly recommended!",
    name: "Nusrat Jahan",
    role: "High School Student",
    avatar: 2,
  },
];

function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("Today");
  const [done, setDone] = useState(false);
  const rows =
    activeTab === "Today"
      ? [
          ["09:00 AM", "Design principles", "Room 204"],
          ["11:00 AM", "Web development", "Computer lab"],
          ["02:00 PM", "Mathematics", "Room 302"],
        ]
      : [
          ["MON", "Design & mathematics", "2 classes"],
          ["WED", "Literature & science", "2 classes"],
          ["FRI", "Weekly review", "Study session"],
        ];
  return (
    <div className="sh-device-scene">
      <div className="sh-laptop">
        <div className="sh-laptop-screen">
          <aside>
            <strong>
              TOOLKIT<span>+</span>
            </strong>
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <span key={tool.path}>
                  <Icon size={10} />
                  {tool.short}
                </span>
              );
            })}
            <small>YOUR EVERYDAY, ORGANIZED.</small>
          </aside>
          <div className="sh-dashboard">
            <div className="sh-dashboard-top">
              <span>⌕ &nbsp; Search</span>
              <span className="sh-avatar">S</span>
            </div>
            <h3>Good Morning, Alex! 👋</h3>
            <p>Here’s your progress today.</p>
            <div className="sh-dashboard-stats">
              <div>
                <strong>3</strong>
                <span>Classes Today</span>
              </div>
              <div>
                <strong>{done ? "4" : "5"}</strong>
                <span>Tasks Left</span>
              </div>
              <div>
                <strong>{done ? "80%" : "75%"}</strong>
                <span>Study Progress</span>
              </div>
              <div>
                <strong>25:00</strong>
                <span>Focus Timer</span>
              </div>
            </div>
            <div className="sh-dashboard-panels">
              <div>
                <div className="sh-panel-heading">
                  <strong>Today’s Schedule</strong>
                  <div role="group" aria-label="Preview schedule period">
                    {["Today", "Week"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        aria-pressed={activeTab === tab}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div aria-live="polite">
                  {rows.map(([time, subject, room], i) => (
                    <div className="sh-schedule-row" key={subject}>
                      <span className={`sh-square sh-square-${i}`} />
                      <div>
                        <b>{time}</b>
                        <strong>{subject}</strong>
                        <small>{room}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sh-progress-panel">
                <strong>Study Progress</strong>
                <div
                  className="sh-progress-ring"
                  style={{ "--progress": done ? "80%" : "75%" }}
                >
                  <div>
                    <b>{done ? "80%" : "75%"}</b>
                    <span>KEEP GOING</span>
                  </div>
                </div>
                <button
                  className="sh-sample-task"
                  onClick={() => setDone(!done)}
                  aria-pressed={done}
                >
                  <span>{done && <Check size={10} />}</span>
                  {done ? "Chapter reviewed!" : "Review one chapter"}
                </button>
              </div>
            </div>
            <span className="sh-demo-caption">
              Interactive preview · illustrative data
            </span>
          </div>
        </div>
        <div className="sh-laptop-base" />
      </div>
      <div className="sh-phone" aria-hidden="true">
        <div className="sh-phone-speaker" />
        <strong>← &nbsp; Focus Timer</strong>
        <div className="sh-timer-ring">
          <span>25:00</span>
        </div>
        <div className="sh-phone-tags">
          <span>Pomodoro</span>
          <span>Short break</span>
        </div>
        <span className="sh-phone-start">Start</span>
        <div className="sh-phone-bottom">
          <BookOpen size={16} />
          <HeartPulse size={16} />
          <Bot size={16} />
        </div>
        <small>ONE THING AT A TIME.</small>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [featureStart, setFeatureStart] = useState(0);
  const [testimonialStart, setTestimonialStart] = useState(0);
  const searchRef = useRef(null);
  const location = useLocation();
  const startPath = user ? "/study-planner" : "/signUp";
  const orderedTools = tools.map(
    (_, index) => tools[(index + featureStart) % tools.length],
  );
  const filteredTools = orderedTools.filter((tool) =>
    `${tool.title} ${tool.detail}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  const orderedTestimonials = testimonials.map(
    (_, index) => testimonials[(index + testimonialStart) % testimonials.length],
  );
  const focusSearch = () => {
    setShowSearch(true);
    document.getElementById("explore-tools")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    const targetId = location.hash.slice(1);
    if (!["overview", "explore-tools"].includes(targetId)) return;
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView();
    });
  }, [location.hash]);

  return (
    <LandingCanvas header={<Navbar onSearch={focusSearch} />}>
      <a className="sh-skip" href="#main-content">
        Skip to content
      </a>
      <main id="main-content">
        <Hero1 startPath={startPath} signedIn={Boolean(user)} />
        <section className="sh-feature-strip" id="explore-tools" aria-labelledby="feature-heading">
          <div className="sh-shell">
            <div className="sh-feature-head">
              <h2 id="feature-heading">
                Explore
                <br />
                Our <span>Features</span>
              </h2>
              <p>
                Powerful tools designed to help you stay organized, focused and
                in control of your student life.
              </p>
              <div
                className="sh-feature-controls"
                role="group"
                aria-label="Browse features"
              >
                <button
                  type="button"
                  aria-label="Previous feature"
                  onClick={() =>
                    setFeatureStart(
                      (current) => (current - 1 + tools.length) % tools.length,
                    )
                  }
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next feature"
                  onClick={() =>
                    setFeatureStart((current) => (current + 1) % tools.length)
                  }
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            {showSearch && (
              <div className="sh-feature-search">
                <Search size={17} aria-hidden="true" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setQuery("");
                      setShowSearch(false);
                    }
                  }}
                  placeholder="Find a tool…"
                  aria-label="Find a tool"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowSearch(false);
                  }}
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className={`sh-six-tools${query ? " sh-filtered-tools" : ""}`} aria-live="polite">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    className={`sh-tool sh-${tool.color}`}
                    to={tool.path}
                    key={tool.path}
                  >
                    <div className="sh-tool-top">
                      <span>0{tool.image + 1}</span>
                      <Icon size={48} strokeWidth={2.6} />
                    </div>
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <span className="sh-tool-arrow">
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                );
              })}
            </div>
            {query && (
              <p className="sh-feature-search-status" role="status">
                {filteredTools.length === 0
                  ? "No tools found. Try study, budget, or wellness."
                  : `${filteredTools.length} ${filteredTools.length === 1 ? "tool" : "tools"} found.`}
              </p>
            )}
          </div>
        </section>
        <StatsBand />
        <section className="sh-overview" id="overview" aria-labelledby="overview-heading">
          <img
            className="sh-overview-plant"
            src="/images/landing/overview-plant.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <div className="sh-overview-inner sh-shell">
            <div className="sh-overview-copy">
              <h2 id="overview-heading">
                A Smarter
                <br />
                <span>Student</span> Life
                <br />
                Starts Here.
              </h2>
              <p>
                TOOLKIT+ brings your academic, financial, health and personal
                growth tools together in one powerful platform.
              </p>
              <a className="sh-button" href="#explore-tools">
                Explore All Features
                <ArrowRight size={16} />
              </a>
            </div>
            <DashboardPreview />
          </div>
        </section>
        <section className="sh-routines sh-shell" aria-labelledby="routines-heading">
          <div className="sh-section-heading">
            <div>
              <span className="sh-eyebrow">LIFE BEYOND THE TO-DO LIST</span>
              <h2 id="routines-heading">A LITTLE MORE <span>TOGETHER.</span></h2>
              <p>From the first class to the last study session. Find your rhythm.</p>
            </div>
            <span className="sh-handwritten sh-routine-note">You’ve got this!<span aria-hidden="true">✳</span></span>
          </div>
          <div className="sh-routine-grid">
            {routines.map((routine) => {
              const Icon = routine.icon;
              return (
                <article key={routine.title} className={`sh-routine sh-${routine.color}`}>
                  <span className="sh-routine-icon"><Icon size={28} aria-hidden="true" /></span>
                  <div>
                    <span className="sh-eyebrow">{routine.label}</span>
                    <h3>{routine.title}</h3>
                    <p>{routine.text}</p>
                    <Link to={routine.path}>{routine.action}<ArrowRight size={14} aria-hidden="true" /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="sh-planner-feature" aria-labelledby="planner-feature-heading">
          <div className="sh-planner-feature-inner sh-shell">
            <span className="sh-planner-paper-note" aria-hidden="true">
              Focus
              <br />
              Creates
              <br />
              Freedom.
            </span>
            <svg className="sh-planner-star" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <path d="m27 2 3 20 20-12-13 18 17 7-21-1 3 20-10-18-17 15 11-21L2 25l21-2L18 5l9 17Z" />
              <path d="M27 7v40M8 26l38 9" />
            </svg>
            <div className="sh-planner-feature-copy">
              <span className="sh-planner-tag">STUDY PLANNER</span>
              <h2 id="planner-feature-heading">
                Turn Your Goals
                <br />
                Into <span>Daily Progress.</span>
              </h2>
              <p>
                Break big ambitions into small, actionable tasks. Track your
                progress, stay motivated and build consistent study habits.
              </p>
              <ul>
                {[
                  "Create and organize tasks",
                  "Set deadlines and priorities",
                  "Track progress with analytics",
                  "Stay consistent and productive",
                ].map((benefit) => (
                  <li key={benefit}>
                    <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link className="sh-planner-cta" to={startPath}>
                Try Study Planner <ArrowRight size={17} />
              </Link>
              <svg className="sh-planner-arrow" viewBox="0 0 90 100" fill="none" aria-hidden="true">
                <path d="M68 5C68 44 52 69 14 82m0 0 28-5M14 82l11-24" />
              </svg>
            </div>
          </div>
        </section>
        <section className="sh-testimonials" aria-labelledby="testimonials-heading">
          <div className="sh-testimonials-inner sh-shell">
            <div className="sh-testimonials-heading">
              <span className="sh-testimonials-tag">TESTIMONIALS</span>
              <h2 id="testimonials-heading">
                Loved by
                <br />
                <span>Students</span>
                <br />
                <em>Everywhere.</em>
              </h2>
            </div>
            <div className="sh-testimonials-top">
              <p>
                Real stories from students who are making their lives better
                with TOOLKIT+.
              </p>
              <div className="sh-testimonials-controls" role="group" aria-label="Browse testimonials">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() =>
                    setTestimonialStart(
                      (current) => (current - 1 + testimonials.length) % testimonials.length,
                    )
                  }
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() =>
                    setTestimonialStart((current) => (current + 1) % testimonials.length)
                  }
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            <div className="sh-testimonials-cards" aria-live="polite">
              {orderedTestimonials.map((item) => (
                <article className="sh-testimonial-card" key={item.name}>
                  <p>“{item.quote}”</p>
                  <span className="sh-testimonial-stars" aria-label="5 out of 5 stars">★★★★★</span>
                  <div className="sh-testimonial-author">
                    <span className={`sh-testimonial-avatar sh-testimonial-avatar-${item.avatar}`} aria-hidden="true" />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.role}</small>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="sh-faq sh-shell" id="faq">
          <div className="sh-faq-heading">
            <span className="sh-faq-tag">FAQ</span>
            <h2>
              Frequently
              <br />
              Asked
              <br />
              <span>Questions.</span>
            </h2>
          </div>
          <div className="sh-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question} name="toolkit-faq">
                <summary>
                  {question}
                  <Plus size={16} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
          <div className="sh-faq-photo">
            <img
              src="/images/landing/faq-backpack-collage.png"
              alt="Black backpack in a colorful paper collage with a university building"
              loading="lazy"
              width="1536"
              height="1024"
            />
            <span className="sh-faq-paper-note sh-handwritten">
              Small steps.
              <br />
              Big
              <br />
              changes.
            </span>
            <Smile className="sh-faq-smile" size={35} strokeWidth={3} aria-hidden="true" />
          </div>
        </section>
        <section className="sh-final-cta">
          <div className="sh-shell sh-final-inner">
            <span className="sh-final-mantra sh-handwritten" aria-hidden="true">Dream<br />Plan<br />Study<br />Repeat</span>
            <div className="sh-final-content">
              <h2>Ready to Level Up<br /><span>Your Student Life?</span></h2>
              <p>Join thousands of students who are already planning better, studying smarter and living healthier.</p>
              <Link to={startPath} className="sh-button sh-button-yellow">
                {user ? "Open My Planner" : "Get Started Now"}
                <ArrowRight size={18} />
              </Link>
            </div>
            <svg className="sh-final-doodle-arrow" viewBox="0 0 90 80" fill="none" aria-hidden="true"><path d="M6 70C29 44 40 30 75 12m0 0-22 1m22-1-10 19" /></svg>
            <span className="sh-final-note sh-handwritten">A smarter<br />you tomorrow.</span>
          </div>
        </section>
      </main>
      <Footer />
    </LandingCanvas>
  );
}
