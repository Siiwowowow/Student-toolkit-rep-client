import { DHAKA_ZONE, classOccurrence, dhakaWallDate, formatTime, taskWindow, taskTimeRange } from "./study-time.mjs";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, BookOpenCheck, CalendarDays, CheckCheck, Clock3, RefreshCw, Sparkles, Target, Wallet } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const dueDate = (task) => new Date(taskWindow(task)?.end ?? NaN);
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const timeLabel = formatTime;

export default function StudentOverview() {
  const { user, refreshRole } = useContext(AuthContext);
  const [state, setState] = useState(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true, inFlight = false;
    const controller = new AbortController();
    const load = async () => {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const data = await authenticatedRequest(user, "/student/overview", { signal: controller.signal });
        if (active) setState({ uid: user.uid, data });
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setState((previous) => ({ uid: user.uid, data: previous?.uid === user.uid ? previous.data : null, error: error.message }));
          if ([401, 403].includes(error.status)) refreshRole();
        }
      } finally { inFlight = false; }
    };
    load();
    const timer = setInterval(load, 60000);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    return () => { active = false; controller.abort(); clearInterval(timer); window.removeEventListener("focus", load); document.removeEventListener("visibilitychange", load); };
  }, [user, refreshRole, revision]);
  const current = state?.uid === user.uid ? state : null;
  const data = current?.data;
  if (!data) return <div className="std-data-state" role={current?.error ? "alert" : "status"}>{current?.error || "Loading your personal progress…"}{current?.error && <button onClick={() => setRevision((value) => value + 1)}>Try again</button>}</div>;
  const { tasks, classes, budget, quizzes } = data;
  const now = new Date();
  const completed = tasks.filter((task) => task.completed === true);
  const pending = tasks.filter((task) => !task.completed);
  const overdue = pending.filter((task) => dueDate(task) < now).length;
  const completion = tasks.length ? Math.round(completed.length / tasks.length * 100) : 0;
  const minutes = completed.reduce((total, task) => total + Math.max(0, Number(task.duration) || 0), 0);
  const upcoming = [...pending].sort((a, b) => dueDate(a) - dueDate(b)).slice(0, 4);
  const subjects = Object.values(tasks.reduce((result, task) => {
    const subject = task.subject || "Other";
    result[subject] ||= { subject, total: 0, done: 0 };
    result[subject].total++; if (task.completed) result[subject].done++;
    return result;
  }, {})).sort((a, b) => b.total - a.total).slice(0, 5);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = dhakaWallDate(now); date.setDate(date.getDate() - (date.getDay() + 6) % 7 + index);
    const rows = tasks.filter((task) => String(task.deadline || "").slice(0, 10) === dateKey(date));
    return { date, total: rows.length, done: rows.filter((task) => task.completed).length };
  });
  const max = Math.max(1, ...week.map((day) => day.total));
  const nextClasses = classes.map((row) => {
    const occurrence = classOccurrence(row, now.getTime());
    if (!occurrence) return null;
    const date = new Date(occurrence.start);
    return { ...row, date };
  }).filter(Boolean).sort((a, b) => a.date - b.date).slice(0, 3);
  return <>
    <div className="std-section-line"><span><span className="std-live-dot" /> Your personal overview</span><button onClick={() => setRevision((value) => value + 1)} title="Refresh progress"><RefreshCw size={13} /> Refresh</button></div>
    {current.error && <div className="std-data-error" role="alert">{current.error} Showing your last loaded progress.</div>}
    <section className="std-metrics" aria-label="Your progress summary">
      <Link to="/study-planner" className="std-metric tone-purple"><span><CheckCheck size={19} /> Tasks completed<ArrowUpRight size={15} /></span><strong>{completed.length}<small> / {tasks.length}</small></strong><p>{pending.length} pending · {overdue} overdue</p><div className="std-track"><i style={{ width: `${completion}%` }} /></div></Link>
      <Link to="/schedule" className="std-metric tone-blue"><span><CalendarDays size={19} /> Weekly classes<ArrowUpRight size={15} /></span><strong>{classes.length}</strong><p>{new Set(classes.map((row) => row.subject)).size} subjects in your timetable</p><small>Keep your week in view</small></Link>
      <Link to="/exam-prep" className="std-metric tone-pink"><span><BookOpenCheck size={19} /> Practice results<ArrowUpRight size={15} /></span><strong>{quizzes.average === null ? "—" : `${quizzes.average}%`}</strong><p>{quizzes.attempts} attempts · latest 100 results</p><small>{quizzes.available} quizzes ready to practice</small></Link>
      <Link to="/budget" className="std-metric tone-mint"><span><Wallet size={19} /> Available balance<ArrowUpRight size={15} /></span><strong>{money(budget.balance)}</strong><p>{money(budget.expenses)} spent · all time</p><small>{budget.entries} transactions recorded</small></Link>
    </section>
    <div className="std-overview-grid">
      <section className="std-panel std-week"><header><div><span>BUILD YOUR MOMENTUM</span><h2>This week’s study plan</h2></div><span className="std-pill">Mon – Sun</span></header><div className="std-chart-legend"><span><i /> Planned tasks</span><span><i /> Completed</span></div><div className="std-week-chart" role="img" aria-label={week.map((day) => `${day.date.toLocaleDateString("en-US", { weekday: "long" })}: ${day.done} of ${day.total} tasks completed`).join("; ")}>
        {week.map((day) => <div className={`std-chart-day${dateKey(day.date) === dateKey(now) ? " is-today" : ""}`} key={dateKey(day.date)}><span>{day.total}</span><div className="std-chart-column"><i style={{ height: `${day.total / max * 100}%` }}><b style={{ height: `${day.total ? day.done / day.total * 100 : 0}%` }} /></i></div><small>{day.date.toLocaleDateString("en-US", { weekday: "short" })}</small></div>)}
      </div><p className="std-panel-note">Tasks grouped by deadline. {week.reduce((sum, day) => sum + day.done, 0)} completed of {week.reduce((sum, day) => sum + day.total, 0)} planned this week.</p></section>
      <section className="std-panel std-progress"><header><div><span>ONE STEP AT A TIME</span><h2>Study progress</h2></div><Target size={20} /></header><div className="std-progress-ring" style={{ "--progress": `${completion}%` }} role="img" aria-label={`${completion}% of all study tasks completed`}><div><strong>{completion}%</strong><small>tasks completed</small></div></div><div className="std-progress-totals"><span><strong>{Math.floor(minutes / 60)}h {minutes % 60}m</strong><small>Planned time of finished tasks</small></span><span><strong>{subjects.length ? new Set(tasks.map((task) => task.subject)).size : 0}</strong><small>Study subjects</small></span></div></section>
      <section className="std-panel"><header><div><span>YOUR NEXT STEPS</span><h2>Tasks to focus on</h2></div><Link to="/study-planner">View all <ArrowUpRight size={14} /></Link></header><div className="std-task-list">{upcoming.length ? upcoming.map((task) => <Link to="/study-planner" className="std-task-row" key={task._id}><span className={`std-task-dot ${task.priority || "medium"}`} /><span><strong>{task.topic || task.subject || "Study task"}</strong><small>{task.subject} · {Number.isNaN(dueDate(task).getTime()) ? "No deadline" : dueDate(task).toLocaleDateString("en-GB", { timeZone: DHAKA_ZONE, day: "numeric", month: "short" })} {taskTimeRange(task)}</small></span><b className={dueDate(task) < now ? "is-overdue" : ""}>{dueDate(task) < now ? "Overdue" : task.priority || "Planned"}</b></Link>) : <p className="std-empty">{tasks.length ? "All caught up! Plan your next study session." : "Add your first study task to start tracking progress."}</p>}</div></section>
      <section className="std-panel"><header><div><span>COMING UP</span><h2>Your next classes</h2></div><Link to="/schedule">Timetable <ArrowUpRight size={14} /></Link></header><div className="std-class-list">{nextClasses.length ? nextClasses.map((row) => <Link to="/schedule" className="std-class-row" key={row._id}><span className="std-class-day"><strong>{row.date.toLocaleDateString("en-US", { timeZone: DHAKA_ZONE, weekday: "short" })}</strong><small>{dhakaWallDate(row.date).getDate()}</small></span><span><strong>{row.subject}</strong><small><Clock3 size={12} /> {timeLabel(row.startTime)} – {timeLabel(row.endTime)}</small></span></Link>) : <p className="std-empty">Your upcoming classes will appear when you build your timetable.</p>}</div></section>
      <section className="std-panel"><header><div><span>SUBJECT BY SUBJECT</span><h2>Learning overview</h2></div><CheckCheck size={19} /></header>{subjects.length ? subjects.map((row) => <div className="std-subject" key={row.subject}><div><strong>{row.subject}</strong><span>{row.done}/{row.total} complete</span></div><div className="std-track"><i style={{ width: `${row.done / row.total * 100}%` }} /></div></div>) : <p className="std-empty">Create tasks for your subjects to see their completion here.</p>}</section>
      <section className="std-panel"><header><div><span>PRACTICE MAKES PROGRESS</span><h2>Recent quiz results</h2></div><Link to="/exam-prep">Practice <ArrowUpRight size={14} /></Link></header>{quizzes.recent.length ? quizzes.recent.map((row, index) => <div className="std-quiz-row" key={`${row.createdAt}-${index}`}><span><strong>{row.topic}</strong><small>{new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small></span><b>{row.percentage}%</b></div>) : <div className="std-empty"><BookOpenCheck size={24} /><p>Complete a Toolkit practice quiz to save your first result.</p></div>}<Link to="/ai-planner" className="std-ai-link"><Sparkles size={17} /><span>Need a little help? Ask your AI assistant.</span><ArrowUpRight size={15} /></Link></section>
    </div>
  </>;
}
