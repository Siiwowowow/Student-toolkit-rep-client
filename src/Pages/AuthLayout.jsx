import { Link } from "react-router";
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Check, CheckCheck, Sparkles } from "lucide-react";
import "./Auth.css";

export default function AuthLayout({ mode = "login", title, description, children }) {
  const signup = mode === "signup";
  const profile = mode === "profile";
  return <main className={`toolkit-auth toolkit-auth-${mode}`}>
    <div className="auth-layout">
      <aside className="auth-story" aria-label="Your Toolkit study space">
        <Link to="/" className="auth-back"><ArrowLeft size={14} /> Back to home</Link>
        <div className="auth-story-eyebrow"><span /> A LITTLE STRUCTURE. A LOT OF POSSIBILITY.</div>
        <h2>{signup ? <>YOUR NEXT<br />{" "}CHAPTER<br />{" "}<span>STARTS HERE.</span></> : profile ? <>YOUR GOALS.<br />{" "}YOUR PACE.<br />{" "}<span>YOUR TOOLKIT.</span></> : <>LESS CHAOS.<br />{" "}MORE FOCUS.<br />{" "}<span>WELCOME BACK.</span></>}</h2>
        <p className="auth-story-copy">A space for your classes, your plans, and everything you’re working towards.</p>
        <div className="auth-planner-art" aria-hidden="true">
          <div className="auth-art-note">Small steps, big things.<Sparkles size={22} /></div>
          <div className="auth-preview-card"><div className="auth-preview-heading"><span><BookOpen size={16} />MY STUDY SPACE</span><span className="auth-preview-dots">•••</span></div><h3>A good day starts<br />{" "}with a little plan.</h3><div className="auth-preview-task"><span className="auth-preview-check"><Check size={12} /></span><span>Make room for learning<small>One topic at a time</small></span><span className="auth-preview-tag">STUDY</span></div><div className="auth-preview-task"><span className="auth-preview-circle" /><span>Keep your week in view<small>Your classes, all together</small></span><CalendarDays size={17} /></div><div className="auth-preview-bottom"><span>PLAN. STUDY. GROW.</span><ArrowUpRight size={17} /></div></div>
          <span className="auth-art-stamp"><Sparkles size={18} /> YOU’VE GOT THIS</span>
        </div>
        <div className="auth-story-foot"><CheckCheck size={17} /><span>Your subjects. Your progress. All in one place.</span></div>
      </aside>
      <section className="auth-form-panel" aria-labelledby="auth-title">
        {!profile && <nav className="auth-mode-tabs" aria-label="Account access"><Link to="/logIn" aria-current={!signup ? "page" : undefined}>Sign in</Link><Link to="/signUp" aria-current={signup ? "page" : undefined}>Create account <ArrowUpRight size={14} /></Link></nav>}
        <header className="auth-form-header"><span className="auth-eyebrow">{profile ? "MAKE IT YOURS" : signup ? "A FRESH START" : "BACK TO YOUR STUDY SPACE"}</span><h1 id="auth-title">{title}</h1><p>{description}</p></header>
        {children}
      </section>
    </div>
  </main>;
}
