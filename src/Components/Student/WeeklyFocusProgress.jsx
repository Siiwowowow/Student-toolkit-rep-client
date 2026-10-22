import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Timer } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import { summarizeFocusWeek } from "../FocusMode/focus-history.mjs";
import { restoreSession } from "../FocusMode/focus-session.mjs";
import { FOCUS_HISTORY_EVENT, flushFocusHistory, loadFocusHistory, pendingFocusHistory, queueFocusHistory, readFocusHistory } from "../FocusMode/focus-history-store";
import "./WeeklyFocusProgress.css";

const timeText = (ms) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
const dayLabel = (date, options) => new Date(`${date}T12:00:00+06:00`).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", ...options });

export default function WeeklyFocusProgress() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState(() => { try { return readFocusHistory(user.uid); } catch { return []; } });
  const [weekOffset, setWeekOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let active = true, inFlight = false;
    const controller = new AbortController();
    const localChange = (event) => {
      if (event?.detail && event.detail.uid !== user.uid) return;
      if (event?.type === "storage" && event.key !== `toolkit-focus-history-v1:${user.uid}`) return;
      try {
        if (active) { setRecords(readFocusHistory(user.uid)); setPending(pendingFocusHistory(user.uid)); }
      } catch { /* Server records remain available when caching is unavailable. */ }
    };
    const load = async () => {
      if (inFlight || document.hidden) return;
      inFlight = true;
      setLoading(true);
      let syncError = "";
      try { await flushFocusHistory(user); }
      catch { syncError = "Focus history sync is temporarily unavailable. Showing available saved sessions."; }
      try {
        const from = summarizeFocusWeek([], Date.now() - weekOffset * 7 * 86400000).start;
        const next = await loadFocusHistory(user, from, controller.signal);
        if (active) { setRecords(next); setLoaded(true); setError(syncError); }
      } catch (failure) {
        if (active && failure.name !== "AbortError") setError("Could not refresh saved focus history. Any available device history is shown below.");
      } finally { if (active) setLoading(false); inFlight = false; }
    };
    // Import the previously supported single-session format without erasing it.
    try {
      const latest = restoreSession(localStorage.getItem(`toolkit-focus-v1:${user.uid}`));
      if (latest) queueFocusHistory(user, latest);
    } catch { /* Sync still loads existing account history. */ }
    localChange();
    load();
    const interval = setInterval(load, 60000);
    window.addEventListener(FOCUS_HISTORY_EVENT, localChange);
    window.addEventListener("storage", localChange);
    window.addEventListener("focus", load);
    window.addEventListener("online", load);
    document.addEventListener("visibilitychange", load);
    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
      window.removeEventListener(FOCUS_HISTORY_EVENT, localChange);
      window.removeEventListener("storage", localChange);
      window.removeEventListener("focus", load);
      window.removeEventListener("online", load);
      document.removeEventListener("visibilitychange", load);
    };
  }, [user, weekOffset, revision]);

  const summary = summarizeFocusWeek(records, Date.now() - weekOffset * 7 * 86400000);
  const maxDay = Math.max(1, ...summary.days.map(day => day.focusedMs + day.wastedMs));
  return <section className="std-panel std-focus-week" aria-labelledby="weekly-focus-title">
    <header><div><span>YOUR ATTENTION OVER TIME</span><h2 id="weekly-focus-title">Weekly focus progress</h2><p>Mon–Sun · Bangladesh time · Reset keeps your history</p></div><Link to="/focus-mode">Focus Mode <ArrowUpRight size={15} /></Link></header>
    <div className="std-focus-toolbar"><div><button type="button" aria-label="Previous focus week" disabled={weekOffset >= 7} onClick={() => setWeekOffset(value => value + 1)}><ChevronLeft size={18} /></button><strong>{dayLabel(summary.days[0].date, { day: "numeric", month: "short" })} – {dayLabel(summary.days[6].date, { day: "numeric", month: "short" })}</strong><button type="button" aria-label="Next focus week" disabled={!weekOffset} onClick={() => setWeekOffset(value => value - 1)}><ChevronRight size={18} /></button></div><button type="button" onClick={() => setRevision(value => value + 1)} disabled={loading} aria-label="Refresh focus history"><RefreshCw size={15} /> {loading ? "Refreshing…" : "Refresh"}</button></div>
    {error && <p className="std-focus-warning" role="alert">{error} <button type="button" onClick={() => setRevision(value => value + 1)}>Retry</button></p>}
    {pending > 0 && <p className="std-focus-warning" role="status">{pending} {pending === 1 ? "session is" : "sessions are"} waiting to sync. Keep this browser data until sync completes.</p>}
    {loading && !records.length && <p className="std-empty" role="status">Loading your saved focus progress…</p>}
    {(loaded || records.length > 0) && <>
      <div className="std-focus-metrics"><div><span>Focused study</span><strong>{timeText(summary.focusedMs)}</strong></div><div><span>Paused / away</span><strong>{timeText(summary.wastedMs)}</strong></div><div><span>Focus score</span><strong>{summary.sessions ? `${summary.score}%` : "—"}</strong></div><div><span>Goals reached</span><strong>{summary.completed}<small> / {summary.sessions} sessions</small></strong></div></div>
      <div className="std-focus-goal"><div><strong>Session goal progress</strong><span>{summary.progress}% · {timeText(summary.focusedMs)} of {timeText(summary.goalMs)} planned</span></div><div className="std-track" role="progressbar" aria-label="Weekly focus goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.progress}><i style={{ width: `${summary.progress}%` }} /></div></div>
      <div className="std-focus-legend"><span><i /> Focused study</span><span><i /> Paused / away</span></div>
      <div className="std-focus-chart" role="img" aria-label={summary.days.map(day => `${dayLabel(day.date, { weekday: "long" })}: ${timeText(day.focusedMs)} focused, ${timeText(day.wastedMs)} paused`).join("; ")}>{summary.days.map(day => <div className="std-focus-day" key={day.date} title={`${day.date}: ${timeText(day.focusedMs)} focused, ${timeText(day.wastedMs)} paused`}><span>{timeText(day.focusedMs)}</span><div><i className="std-focus-bar-away" style={{ height: `${day.wastedMs / maxDay * 100}%` }} /><i className="std-focus-bar-study" style={{ height: `${day.focusedMs / maxDay * 100}%` }} /></div><small>{dayLabel(day.date, { weekday: "short" })}</small></div>)}</div>
      <p className="std-focus-caption">Focus score compares focused time with focused + paused time. {summary.interruptions} interruptions this week.</p>
      {summary.recent.length ? <div className="std-focus-recent"><h3>Saved sessions this week</h3>{summary.recent.slice(0, 5).map(record => <article key={record.id}><div><strong>{record.subject}</strong><small>{record.chapters.join(", ")}</small><small>{dayLabel(new Date(record.startedAt + 6 * 3600000).toISOString().slice(0, 10), { day: "numeric", month: "short" })} · {record.status === "completed" ? "Goal completed" : record.status === "ended" ? "Session ended" : "In progress"}</small></div><span><strong>{timeText(record.weeklyFocusedMs)}</strong><small>focused this week</small></span></article>)}</div> : <div className="std-focus-empty"><Timer size={24} /><p>No focus sessions for this week yet. Start a session to build your progress.</p><Link to="/focus-mode">Start focusing <ArrowUpRight size={14} /></Link></div>}
    </>}
  </section>;
}
