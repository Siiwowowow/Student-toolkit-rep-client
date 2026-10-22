import { useContext, useState } from "react";
import { BookOpen, CheckCircle2, CirclePause, Play, RotateCcw, ShieldCheck, Square, Target, Timer, TriangleAlert } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import useCurriculum from "../Student/useCurriculum";
import FocusStudyFields from "./FocusStudyFields";
import { createSession, formatDuration, formatMinutes, getMetrics, isActive, transition } from "./focus-session.mjs";
import { flushFocusHistory } from "./focus-history-store";
import { FocusSessionContext } from "./FocusSessionProvider";
import "./FocusMode.css";

function FocusWorkspace() {
  const { user, profile } = useContext(AuthContext);
  const curriculum = useCurriculum();
  const groupName = { science: "Science", commerce: "Commerce / Business Studies", arts: "Arts / Humanities" }[profile?.academicProfile?.group] || "your academic group";
  const { session, sessionRef, now, storageError, historyError, lastHistory, persistHistory, update } = useContext(FocusSessionContext);
  const [subject, setSubject] = useState("");
  const [chapters, setChapters] = useState([]);
  const [minutes, setMinutes] = useState(25);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const active = isActive(session);
  const metrics = getMetrics(session, now);
  const selectedSubject = curriculum.subjects.find((item) => item.name === subject);
  const selectedChapters = (selectedSubject?.chapters || []).map((chapter) => chapter.name).filter((name) => chapters.includes(name));
  const canStart = !curriculum.loading && !curriculum.error && selectedSubject && selectedChapters.length > 0;

  const start = (event) => {
    event.preventDefault();
    if (document.hidden || !document.hasFocus()) return;
    const duration = Number(minutes);
    if (!canStart || !Number.isInteger(duration) || duration < 1 || duration > 180) return;
    if (!persistHistory(transition(sessionRef.current, "finish", Date.now()), true)) return;
    setResetMessage("");
    setConfirmEnd(false);
    update(createSession(selectedSubject.name, duration, Date.now(), selectedChapters));
  };
  const resume = () => {
    if (document.hidden || !document.hasFocus()) return;
    setConfirmEnd(false);
    update(transition(sessionRef.current, "resume", Date.now()));
  };
  const finished = session && !active;
  const reset = () => {
    const archived = transition(sessionRef.current, "finish", Date.now());
    if (!persistHistory(archived, true)) return;
    update(null);
    setSubject("");
    setChapters([]);
    setMinutes(25);
    setConfirmEnd(false);
    setResetMessage("Focus Mode reset. Your previous focus history has been kept in your dashboard.");
  };

  return (
    <main className="focus-page study-tool-page">
      <div className="focus-shell">
        <header className="focus-heading">
          <div><span className="focus-eyebrow"><BookOpen size={16} /> YOUR STUDY SPACE</span><h1>Less distraction.<br /><span>More focus.</span></h1><p>Give your studies your full attention. See where every minute goes.</p></div>
          <span className="focus-strict"><ShieldCheck size={18} /> Strict focus · Always on</span>
        </header>

        <div className="focus-layout">
          <section className={`focus-timer-card${session?.status === "paused" ? " is-paused" : ""}`} aria-label="Study timer">
            <span className={`focus-status focus-status-${session?.status || "ready"}`} role="status">
              {session?.status === "running" ? "● Focusing" : session?.status === "paused" ? "Ⅱ Focus paused" : session?.status === "completed" ? "✓ Goal completed" : finished ? "Session ended" : "Ready when you are"}
            </span>
            <h2>{session?.subject || "One subject. Your full attention."}</h2>
            {session?.chapters?.length > 0 && <ul className="focus-session-chapters" aria-label="Session chapters">{session.chapters.map((chapter) => <li key={chapter}>{chapter}</li>)}</ul>}
            <div className="focus-dial" style={{ "--focus-progress": `${session ? metrics.focusedMs / session.goalMs * 100 : 0}%` }}>
              <div><Timer size={25} /><span className="focus-clock" role="timer" aria-label="Remaining study time">{formatDuration(session ? metrics.remainingMs : Number(minutes) * 60000 || 0)}</span><span>study time remaining</span></div>
            </div>
            <p className="focus-timer-caption">{session?.status === "paused" ? "Your study timer is paused. Returning to this page resumes focus automatically. For a manual break, press Resume focus." : session?.status === "completed" ? "You reached your study goal. Take a well-earned break!" : "Time spent in Focus Mode or Focus Study Mood counts as study time."}</p>
            {active && <div className="focus-actions">
              {session.status === "paused" ? <button className="focus-primary" onClick={resume}><Play size={18} /> Resume focus</button> : <button className="focus-secondary" onClick={() => update(transition(sessionRef.current, "pause", Date.now()))}><CirclePause size={18} /> Pause</button>}
              <button className="focus-secondary" onClick={() => setConfirmEnd(true)}><Square size={16} /> End session</button>
            </div>}
            {confirmEnd && active && <div className="focus-end-confirm" role="group" aria-label="Confirm end session"><p>End this session and keep your results?</p><button className="focus-primary" onClick={() => { update(transition(sessionRef.current, "finish", Date.now())); setConfirmEnd(false); }}>Yes, end session</button><button className="focus-secondary" onClick={() => setConfirmEnd(false)}>Keep studying</button></div>}
            {finished && <p className="focus-result"><CheckCircle2 size={18} /> {formatDuration(metrics.focusedMs)} studied · {metrics.score}% focus</p>}
            <div className="focus-reset"><button type="button" className="focus-secondary" onClick={reset}><RotateCcw size={17} /> Reset Focus Mode</button><p>Clear the timer and study selections. Your dashboard history stays saved.</p></div>
            {resetMessage && <p className="focus-reset-message" role="status">{resetMessage}</p>}
          </section>

          <aside className="focus-sidebar">
            <section className="focus-card">
              <h2><Target size={19} /> {active ? "Your study goal" : finished ? "Start another session" : "Set your study goal"}</h2>
              {active ? <div className="focus-goal"><strong>{session.subject}</strong><p>{session.goalMs / 60000} minutes of focused study</p><div className="focus-progress"><span style={{ width: `${metrics.focusedMs / session.goalMs * 100}%` }} /></div><small>{Math.floor(metrics.focusedMs / session.goalMs * 100)}% of your goal completed</small></div> : <form onSubmit={start}>
                <FocusStudyFields curriculum={curriculum} groupName={groupName} subject={subject} onSubject={setSubject} chapters={chapters} onChapters={setChapters} />
                <label htmlFor="focus-duration">Study duration (minutes)</label><input id="focus-duration" type="number" min="1" max="180" step="1" value={minutes} onChange={(event) => setMinutes(event.target.value)} required />
                <div className="focus-presets">{[25, 45, 60].map((duration) => <button key={duration} type="button" aria-pressed={Number(minutes) === duration} onClick={() => setMinutes(duration)}>{duration} min</button>)}</div>
                <button type="submit" className="focus-primary" disabled={!canStart}><Play size={17} /> Start focus session</button>
              </form>}
            </section>
            <section className="focus-card focus-rules"><h2><ShieldCheck size={19} /> How strict focus works</h2><ul><li>Switch tabs, minimize, lock your screen, or open another app: focus pauses automatically.</li><li>Return to either study route: wasted time stops and study time resumes automatically. Your total wasted time stays visible below.</li><li>Focus Mode stays active in Focus Study Mood too. Closing or reloading the website ends the session and stops wasted time. Manual pauses use the Resume focus button.</li></ul><p>Works on desktop, tablet, and mobile when the browser reports visibility or focus changes. It cannot detect distractions outside your device.</p></section>
          </aside>
        </div>

        {storageError && <p className="focus-storage-warning" role="alert">Browser storage is unavailable. This session works here, but cannot be saved when you leave.</p>}
        {historyError && <p className="focus-storage-warning" role="alert">{historyError} <button type="button" onClick={() => { lastHistory.current = null; if (sessionRef.current) persistHistory(sessionRef.current, true); else flushFocusHistory(user).catch(() => {}); }}>Retry sync</button></p>}

        <section className="focus-insights" aria-label="Session insights">
          <div className="focus-section-heading"><div><span className="focus-eyebrow">YOUR ATTENTION, MEASURED</span><h2>Where did your time go?</h2></div><p>{active ? "Live session insights" : "Your latest session"}</p></div>
          <div className="focus-stats">
            <article className="focus-card"><BookOpen size={21} /><span>Focused study</span><strong>{formatDuration(metrics.focusedMs)}</strong><small>Time you gave your studies</small></article>
            <article className="focus-card focus-waste"><TriangleAlert size={21} /><span>Paused / wasted time</span><strong role="timer" aria-label="Total wasted time">{formatDuration(metrics.wastedMs)}</strong><small>{formatMinutes(metrics.wastedMs)} wasted</small><small>{session?.status === "paused" ? session.interruptions.at(-1)?.reason === "Manual pause" ? "Manual break — press Resume focus to stop" : "Counting while away — stops when you return" : metrics.wastedMs > 0 ? "Counter stopped — your wasted time is saved" : "Every interruption adds up"}</small></article>
            <article className="focus-card"><Target size={21} /><span>Focus score</span><strong>{session ? `${metrics.score}%` : "—"}</strong><small>Study time ÷ total session time</small></article>
            <article className="focus-card"><CirclePause size={21} /><span>Interruptions</span><strong>{session?.interruptions.length || 0}</strong><small>Times your session was paused</small></article>
          </div>
          <section className="focus-card focus-log"><h3>Interruption log</h3><p>See exactly how long each pause lasted.</p>
            {session?.interruptions.length ? <ol>{session.interruptions.map((entry, index) => <li key={`${entry.startedAt}-${index}`}><div><strong>{entry.reason}</strong><span>{new Date(entry.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {entry.endedAt === null ? "Ongoing pause" : "Resumed / ended"}</span></div><strong className="focus-waste" title={formatMinutes((entry.endedAt ?? now) - entry.startedAt)}>{formatDuration((entry.endedAt ?? now) - entry.startedAt)}</strong></li>).reverse()}</ol> : <div className="focus-empty"><ShieldCheck size={23} /><span>{session ? "No interruptions. Keep your attention on your studies." : "Start a study session to track your focus and wasted time."}</span></div>}
          </section>
          <p className="focus-local-note">Sessions are saved to your account and included in your dashboard's weekly focus progress. Resetting or starting again keeps your history. Offline changes sync when you return online.</p>
        </section>
      </div>
    </main>
  );
}

export default function FocusMode() {
  const { user, profile } = useContext(AuthContext);
  const storageKey = `toolkit-focus-v1:${user.uid}`;
  return <FocusWorkspace key={`${storageKey}:${profile?.academicProfile?.group}`} storageKey={storageKey} />;
}
