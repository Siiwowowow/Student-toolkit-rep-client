import { useContext, useState } from "react";
import { Bell, CalendarClock, FileEdit, Plus, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";
import { useAdminData } from "./useAdminData";
import { ConfirmDialog, DataState, PageHeading } from "./AdminShared";
import QuizScheduleEditor from "./QuizScheduleEditor";
import QuizSyllabus from "../Student/QuizSyllabus";
import useStudyClock from "../Student/useStudyClock";
import { quizCountdown, quizDateLabel } from "../Student/quiz-time.mjs";
import "../Student/QuizUpdates.css";

export default function QuizUpdatesManager() {
  const { user, refreshRole } = useContext(AuthContext);
  const state = useAdminData("/admin/quiz-schedules");
  const [editor, setEditor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const now = useStudyClock();
  const failure = error => { toast.error(error.message); if ([401, 403].includes(error.status)) refreshRole(); };
  const save = async payload => {
    setBusy(true);
    try {
      await authenticatedRequest(user, `/admin/quiz-schedules${editor.id ? `/${encodeURIComponent(editor.id)}` : ""}`, { method: editor.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      toast.success(payload.status === "published" ? "Quiz update published." : "Quiz draft saved.");
      setEditor(null); state.reload();
    } catch (error) { failure(error); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await authenticatedRequest(user, `/admin/quiz-schedules/${encodeURIComponent(selected.id)}`, { method: "DELETE" }); setSelected(null); state.reload(); toast.success("Quiz update removed."); }
    catch (error) { failure(error); } finally { setBusy(false); }
  };
  return <><PageHeading eyebrow="COLLEGE QUIZ PLANNER" title="Quiz Update" description="Publish quiz dates, preparation reminders and a clear syllabus for your college."><button type="button" className="adm-icon-button adm-bordered" disabled={busy || state.loading} onClick={state.reload} aria-label="Refresh quiz updates"><RefreshCw size={18} /></button><button type="button" className="adm-button" disabled={busy} onClick={() => setEditor({})}><Plus size={17} />New quiz reminder</button></PageHeading>
    {editor && <QuizScheduleEditor key={editor.id || "new"} item={editor} busy={busy} onSave={save} onCancel={() => setEditor(null)} />}
    <DataState {...state} />
    {state.data && <section className="adm-panel"><div className="adm-panel-heading"><div><h2>Quiz dates & syllabus</h2><p>Students see published updates matching their academic profile.</p></div><span className="adm-subtle-pill">{state.data.length} updates</span></div>{!state.data.length ? <div className="adm-empty"><CalendarClock size={35} /><h3>Plan the next college quiz</h3><p>Add a date, reminder and subject-wise syllabus to get started.</p></div> : <div className="quiz-update-grid">{state.data.map(item => <article className="quiz-update-card" key={item.id}><div className="quiz-card-heading"><span className={`adm-status ${item.status === "published" ? "status-active" : "status-draft"}`}>{item.status}</span><span className="quiz-countdown"><CalendarClock size={16} />{quizCountdown(item.quizAt, now)}</span></div><h3>{item.title}</h3><p className="quiz-college">{item.college} · {item.group === "all" ? "All groups" : item.group} · {item.academicYear === "all" ? "Both years" : `${item.academicYear} year`}</p><p><strong>{quizDateLabel(item.quizAt)}</strong> (BD time)</p><p>{item.description}</p><p className="quiz-reminder-note"><Bell size={15} />{item.reminderEnabled ? `Reminder ${item.reminderMinutes < 60 ? `${item.reminderMinutes} minutes` : `${item.reminderMinutes / 60} hours`} before quiz` : "Reminder disabled"}</p><QuizSyllabus syllabus={item.syllabus} /><div className="adm-card-actions"><button type="button" className="adm-button adm-button-secondary" disabled={busy} onClick={() => { setEditor(item); window.scrollTo({ top: 0, behavior: "smooth" }); }}><FileEdit size={15} />Edit update</button><button type="button" className="adm-icon-button adm-danger-text" disabled={busy} aria-label={`Remove ${item.title}`} onClick={() => setSelected(item)}><Trash2 size={17} /></button></div></article>)}</div>}</section>}
    {selected && <ConfirmDialog title="Remove quiz update?" description={`${selected.title} and its syllabus will no longer be visible to students.`} busy={busy} onClose={() => setSelected(null)} onConfirm={remove} />}
  </>;
}
