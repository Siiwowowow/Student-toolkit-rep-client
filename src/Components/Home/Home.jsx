import { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import Navbar from "../Navbar/Navbar";
import "./MinimalHome.css";

const tools = [
  { title: "Class schedule", path: "/schedule", description: "Know what is next. Keep your week in order." },
  { title: "Study planner", path: "/study-planner", description: "Turn a long to-do list into a manageable day." },
  { title: "Quiz tracker", path: "/quiz-tracker", description: "Tick off chapters and topics. See how far you have come." },
  { title: "Exam preparation", path: "/exam-prep", description: "Practice by subject and make time for review." },
  { title: "AI assistant", path: "/ai-planner", description: "Work through a question when you need a little direction." },
  { title: "Budget tracker", path: "/budget", description: "Keep an eye on spending, with one less thing to worry about." },
];
const questions = [
  ["Where should I start?", "Start with your timetable or one study task. When a college quiz is coming up, open Quiz tracker to follow your chapter and topic progress."],
  ["Do I need an account?", "Sign in with email or Google to save your schedule, study tasks, budget and quiz preparation progress."],
  ["Can I use it on my phone?", "Yes. Your tools work in a mobile browser, and your saved progress stays connected to your account."],
];

export default function Home() {
  const { user, role } = useContext(AuthContext);
  const { hash } = useLocation();
  const startPath = user ? role === "admin" ? "/admin" : "/student-dashboard" : "/signUp";
  useEffect(() => {
    const id = hash.slice(1);
    if (!["overview", "explore-tools", "faq", "top", "main-content"].includes(id)) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return <div className="minimal-home" id="top">
    <a className="minimal-skip" href="#main-content">Skip to content</a>
    <Navbar />
    <main className="minimal-shell" id="main-content">
      <section className="minimal-hero" aria-labelledby="minimal-hero-title">
        <p className="minimal-eyebrow">A little structure for student life</p>
        <h1 id="minimal-hero-title">Less noise.<br /><em>More progress.</em></h1>
        <p className="minimal-hero-description">Your classes, study plans and quiz preparation, in one place. Make a plan, tick things off, and get on with your day.</p>
        <div className="minimal-hero-actions"><Link className="minimal-primary" to={startPath}>{user ? "Go to your workspace" : "Start your day"}<ArrowUpRight size={18} aria-hidden="true" /></Link><a className="minimal-text-link" href="#explore-tools">Explore the tools<ArrowRight size={17} aria-hidden="true" /></a></div>
        <p className="minimal-hero-note">A simpler space to plan, study and keep moving.</p>
      </section>
      <section className="minimal-section minimal-tools" id="explore-tools" aria-labelledby="minimal-tools-title">
        <div className="minimal-section-heading"><p className="minimal-eyebrow">The essentials</p><h2 id="minimal-tools-title">A place for<br />every next step.</h2><p>Just the tools you need.<br />Ready when you are.</p></div>
        <div className="minimal-tool-list">{tools.map((tool, index) => <Link className="minimal-tool-row" to={tool.path} key={tool.path}><span className="minimal-tool-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="minimal-tool-copy"><h3>{tool.title}</h3><p>{tool.description}</p></span><ArrowUpRight size={22} strokeWidth={1.4} aria-hidden="true" /></Link>)}</div>
      </section>
      <section className="minimal-section minimal-about" id="overview" aria-labelledby="minimal-about-title">
        <div className="minimal-section-heading"><p className="minimal-eyebrow">Room to focus</p><h2 id="minimal-about-title">Small steps.<br />A steadier rhythm.</h2></div>
        <div className="minimal-about-copy"><p>Student life has enough moving parts. Your study space can be simple.</p><p>Plan the week ahead, check what is due, and work through your quiz syllabus one topic at a time. Come back to a clear picture of what you have finished and what is left.</p><Link className="minimal-text-link" to="/quiz-tracker">Find your next topic<ArrowRight size={17} aria-hidden="true" /></Link></div>
      </section>
      <section className="minimal-section minimal-faq" id="faq" aria-labelledby="minimal-faq-title">
        <div className="minimal-section-heading"><p className="minimal-eyebrow">Good to know</p><h2 id="minimal-faq-title">A few answers.</h2></div>
        <div className="minimal-faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={18} strokeWidth={1.5} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
      </section>
    </main>
    <footer className="minimal-footer minimal-shell"><div><Link className="minimal-footer-brand" to="/">TOOLKIT<span>+</span></Link><p>A little more focus, every day.</p></div><nav aria-label="Footer"><a href="#explore-tools">Tools</a><a href="#overview">About</a><a href="#faq">Questions</a><a href="#top">Back to top<ArrowUpRight size={14} aria-hidden="true" /></a></nav></footer>
  </div>;
}