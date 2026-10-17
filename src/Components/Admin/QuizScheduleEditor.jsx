import { useState } from "react";
import { Save, Upload, X } from "lucide-react";
import { DEFAULT_COLLEGE, dhakaDateInput } from "../Student/quiz-time.mjs";
import QuizSyllabusEditor from "./QuizSyllabusEditor";
import useStudyClock from "../Student/useStudyClock";
import { quizCountdown } from "../Student/quiz-time.mjs";

const blankChapter = () => ({ chapter: "", topics: [""] });
const blankSubject = () => ({ subject: "", chapters: [blankChapter()] });
export default function QuizScheduleEditor({ item, busy, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ title: item.title || "", college: item.college || DEFAULT_COLLEGE, group: item.group || "all", academicYear: item.academicYear || "all", status: item.status || "draft", quizAt: dhakaDateInput(item.quizAt), reminderEnabled: item.reminderEnabled ?? true, reminderMinutes: item.reminderMinutes || 1440, description: item.description || "" }));
  const [syllabus, setSyllabus] = useState(item.syllabus || [blankSubject()]);
  const [error, setError] = useState("");
  const now = useStudyClock();
  const field = (name, value) => setForm(current => ({ ...current, [name]: value }));
  const importFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 250000) throw new Error("Upload a JSON file smaller than 250 KB.");
      const data = JSON.parse(await file.text());
      const rows = Array.isArray(data) ? data : data.syllabus;
      let count = 0;
      if (!Array.isArray(rows) || !rows.length || rows.length > 20 || rows.some(row => typeof row?.subject !== "string" || !row.subject.trim() || row.subject.length > 120 || !Array.isArray(row.chapters) || !row.chapters.length || row.chapters.length > 30 || row.chapters.some(chapter => typeof chapter?.chapter !== "string" || !chapter.chapter.trim() || chapter.chapter.length > 160 || !Array.isArray(chapter.topics) || !chapter.topics.length || chapter.topics.length > 50 || chapter.topics.some(topic => { count++; return typeof topic !== "string" || !topic.trim() || topic.length > 300; }))) || count > 500) throw new Error("Use subjects with chapters and topic strings. Limits: 20 subjects, 30 chapters per subject, 50 topics per chapter, 500 topics total.");
      setSyllabus(rows.map(row => ({ subject: row.subject, chapters: row.chapters.map(chapter => ({ chapter: chapter.chapter, topics: [...chapter.topics] })) })));
      setError("");
    } catch (failure) { setError(failure instanceof SyntaxError ? "This file is not valid JSON." : failure.message); }
  };
  const submit = event => {
    event.preventDefault();
    const quizAt = new Date(`${form.quizAt}:00+06:00`);
    if (!Number.isFinite(quizAt.getTime())) { setError("Enter a valid quiz date and time."); return; }
    setError("");
    if (syllabus.some(subject => !subject.subject.trim() || !subject.chapters.length || subject.chapters.some(chapter => !chapter.chapter.trim() || !chapter.topics.length || chapter.topics.some(topic => !topic.trim())))) { setError("Choose a subject, at least one chapter and at least one topic per chapter."); return; }
    if (syllabus.reduce((total, subject) => total + subject.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0), 0) > 500) { setError("Select up to 500 topics in total for one quiz."); return; }
    onSave({ ...form, quizAt: quizAt.toISOString(), reminderMinutes: Number(form.reminderMinutes), syllabus });
  };
  return <form className="adm-panel adm-editor quiz-schedule-editor" onSubmit={submit}>
    <div className="adm-panel-heading"><div><span className="adm-eyebrow">COLLEGE QUIZ SCHEDULE</span><h2>{item.id ? "Edit quiz update" : "New quiz reminder"}</h2><p>Set the quiz time and the exact syllabus students should prepare.</p></div><button type="button" className="adm-icon-button" aria-label="Close quiz schedule editor" disabled={busy} onClick={onCancel}><X size={20} /></button></div>
    <fieldset disabled={busy} className="adm-editor-fields">
      <div className="adm-form-row"><label>Quiz title<input required maxLength={160} value={form.title} onChange={e => field("title", e.target.value)} placeholder="e.g. Weekly Physics Quiz 03" /></label><label>College<input required maxLength={160} value={form.college} onChange={e => field("college", e.target.value)} /></label></div>
      <div className="adm-form-row"><label>Group<select value={form.group} onChange={e => field("group", e.target.value)}><option value="all">All groups</option><option value="science">Science</option><option value="commerce">Commerce</option><option value="arts">Arts</option></select></label><label>Academic year<select value={form.academicYear} onChange={e => field("academicYear", e.target.value)}><option value="all">Both years</option><option value="first">First year (XI)</option><option value="second">Second year (XII)</option></select></label></div>
      <div className="adm-form-row"><label>Quiz date & time (Bangladesh, UTC+6)<input required type="datetime-local" value={form.quizAt} onChange={e => field("quizAt", e.target.value)} /><small>Remaining time is calculated automatically for students.</small>{form.quizAt && <strong className="quiz-countdown" role="timer" aria-live="off">{quizCountdown(`${form.quizAt}:00+06:00`, now)}</strong>}</label><label>Status<select value={form.status} onChange={e => field("status", e.target.value)}><option value="draft">Draft — admin only</option><option value="published">Published — visible to matching students</option></select></label></div>
      <label>Preparation notes<textarea maxLength={1000} rows={2} value={form.description} onChange={e => field("description", e.target.value)} placeholder="Instructions or preparation advice" /></label>
      <div className="quiz-reminder-settings"><label className="quiz-checkbox"><input type="checkbox" checked={form.reminderEnabled} onChange={e => field("reminderEnabled", e.target.checked)} />Enable quiz reminder</label><label>Remind students before the quiz<select value={form.reminderMinutes} onChange={e => field("reminderMinutes", e.target.value)}>{[15, 30, 60, 180, 1440, 2880, 10080].map(minutes => <option key={minutes} value={minutes}>{minutes < 60 ? `${minutes} minutes` : minutes < 1440 ? `${minutes / 60} hours` : `${minutes / 1440} days`}</option>)}</select></label><p>Students receive an in-app reminder while the app is open during this period.</p></div>
      <QuizSyllabusEditor group={form.group} syllabus={syllabus} onChange={setSyllabus} />
      <details className="quiz-import"><summary><Upload size={16} />Upload an existing syllabus JSON file</summary><label>Choose syllabus file<input type="file" accept=".json,application/json" onChange={importFile} /></label><p>Uploading replaces the current syllabus. Format:</p><pre>{JSON.stringify([{ subject: "Physics", chapters: [{ chapter: "Vectors", topics: ["Vector addition", "Dot product"] }] }], null, 2)}</pre></details>
      {error && <p className="quiz-error" role="alert">{error}</p>}
      <div className="adm-editor-actions"><p>{form.status === "published" ? "Visible to students whose college, group and year match." : "Drafts stay private until published."}</p><button type="button" className="adm-button adm-button-secondary" onClick={onCancel}>Cancel</button><button className="adm-button" type="submit"><Save size={16} />{busy ? "Saving..." : "Save quiz update"}</button></div>
    </fieldset>
  </form>;
}
