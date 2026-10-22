import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Bell, BookOpen, CalendarClock, RefreshCw } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import useQuizUpdates from "./useQuizUpdates";
import useStudyClock from "./useStudyClock";
import QuizPreparationTracker from "./QuizPreparationTracker";
import QuizSyllabus from "./QuizSyllabus";
import { NotificationContext } from "../Notifications/notification-context";
import { DEFAULT_COLLEGE, quizCountdown, quizDateLabel } from "./quiz-time.mjs";
import "./QuizUpdates.css";

export default function StudentQuizUpdates({ tracker = false }) {
  const { profile } = useContext(AuthContext);
  const state = useQuizUpdates();
  const feed = useContext(NotificationContext);
  const now = useStudyClock();
  const [filter, setFilter] = useState(tracker ? "all" : "upcoming");
  const { hash } = useLocation();
  const scrolled = useRef(null);
  const attemptedRead = useRef(null);
  const selectedId = hash.startsWith("#quiz-") ? hash.slice(6) : null;
  const items = state.items.filter(item => item.id === selectedId || filter === "all" || (filter === "past" ? new Date(item.quizAt).getTime() <= now : new Date(item.quizAt).getTime() > now));
  useEffect(() => {
    if (!selectedId) { scrolled.current = null; return; }
    const element = document.getElementById(`quiz-${selectedId}`);
    if (element && scrolled.current !== selectedId) {
      scrolled.current = selectedId;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedId, state.items]);
  useEffect(() => {
    const notice = feed.items.find(item => item.id === `quiz:${selectedId}`);
    const key = notice ? `${profile.uid}:${notice.id}:${notice.version}` : null;
    if (notice && !notice.read && attemptedRead.current !== key) {
      attemptedRead.current = key;
      feed.markRead(notice.id);
    }
    if (!selectedId) attemptedRead.current = null;
  }, [feed, selectedId, profile.uid]);
  return <div className={`student-quiz-updates${tracker ? " study-tool-page" : ""}`}>
    <header className="quiz-page-heading"><div><span className="quiz-eyebrow"><BookOpen size={16} /> PREPARE WITH A PLAN</span><h1>{tracker ? "Quiz tracker" : "Quiz updates"}</h1><p>{tracker ? "Tick off chapters and topics to see how much of each quiz syllabus you have finished." : "Your college quiz dates, reminders and syllabus."}</p><p className="quiz-college">{profile.academicProfile.college || DEFAULT_COLLEGE} · {profile.academicProfile.group} · {profile.academicProfile.academicYear} year</p></div><div className="quiz-page-actions"><Link className="quiz-action" to={tracker ? "/student-dashboard/quiz-updates" : "/quiz-tracker"}>{tracker ? "View quiz updates" : "Open quiz tracker"}</Link><button type="button" className="quiz-action" onClick={state.reload} disabled={state.loading}><RefreshCw size={16} />Refresh</button></div></header>
    <div className="quiz-student-notice"><Bell size={20} /><p>Reminders appear while the app is open. All quiz times use Bangladesh time (UTC+6). <Link to="/profile">Check your college and academic profile</Link>.</p></div>
    <div className="quiz-tabs" role="group" aria-label="Filter quiz dates">{["upcoming", "past", "all"].map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "upcoming" ? "Upcoming quizzes" : value === "past" ? "Past quizzes" : "All quizzes"}</button>)}</div>
    {state.loading && <p className="quiz-state" role="status">Loading your quiz updates...</p>}
    {state.error && <div className="quiz-state quiz-error" role="alert"><p>{state.error}</p><button type="button" className="quiz-action" onClick={state.reload}>Try again</button></div>}
    {selectedId && !state.loading && !state.error && !state.items.some(item => item.id === selectedId) && <p className="quiz-error" role="status">This quiz update is no longer available for your profile.</p>}
    {!state.loading && !state.error && !items.length && <div className="quiz-state"><CalendarClock size={36} /><h2>No {filter === "all" ? "" : `${filter} `}quizzes yet</h2><p>Published quizzes for your college, group and year will appear here.</p></div>}
    <div className="quiz-update-grid">{items.map(item => <article className="quiz-update-card" id={`quiz-${item.id}`} key={item.id}><div className="quiz-card-heading"><span className="quiz-eyebrow">{new Date(item.quizAt).getTime() > now ? "UPCOMING QUIZ" : "Quiz completed"}</span><CalendarClock size={20} /></div><h2>{item.title}</h2><p className="quiz-college">{item.college}</p><time dateTime={item.quizAt}>{quizDateLabel(item.quizAt)} (BD time)</time><div className="quiz-countdown-panel"><span>Time remaining</span><strong role="timer" aria-live="off">{new Date(item.quizAt).getTime() <= now ? "Quiz completed" : quizCountdown(item.quizAt, now)}</strong></div>{item.description && <p className="quiz-description">{item.description}</p>}<p className="quiz-reminder-note"><Bell size={15} />{item.reminderEnabled ? `In-app reminder enabled · ${item.reminderMinutes < 60 ? `${item.reminderMinutes} minutes` : `${item.reminderMinutes / 60} hours`} before quiz` : "No reminder set"}</p><h3 className="quiz-syllabus-title"><BookOpen size={17} />Syllabus to prepare</h3>{tracker ? <QuizPreparationTracker item={item} onSave={state.saveChapter} /> : <><QuizSyllabus syllabus={item.syllabus} /><Link className="quiz-action quiz-track-link" to={`/quiz-tracker#quiz-${item.id}`}>Track chapters & topics</Link></>}</article>)}</div>
  </div>;
}
