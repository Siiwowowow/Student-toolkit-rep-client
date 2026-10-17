import { useState } from "react";
import { CheckCheck, Plus, Trash2 } from "lucide-react";
import { useAdminData } from "./useAdminData";

const blankChapter = () => ({ chapter: "", topics: [""] });
const blankSubject = () => ({ subject: "", chapters: [blankChapter()] });
const same = (a, b) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
const fromCatalog = subject => ({ subject: subject.name, chapters: subject.chapters.map(chapter => ({ chapter: chapter.name, topics: [...chapter.topics] })) });

function SubjectEditor({ row, index, catalog, loading, onChange, onRemove, canRemove }) {
  const [custom, setCustom] = useState(false);
  const selected = catalog.find(subject => same(subject.name, row.subject));
  const hasCustomContent = selected && row.chapters.some(chapter => {
    const original = selected.chapters.find(item => same(item.name, chapter.chapter));
    return !original || chapter.topics.some(topic => !original.topics.includes(topic));
  });
  const manual = custom || !!row.subject && !selected || hasCustomContent;
  const updateChapter = (ci, values) => onChange({ ...row, chapters: row.chapters.map((chapter, i) => i === ci ? { ...chapter, ...values } : chapter) });
  const chooseSubject = id => {
    if (id === "custom") { setCustom(true); return; }
    const subject = catalog.find(subject => subject.id === id);
    setCustom(false);
    if (subject) onChange(fromCatalog(subject));
  };
  const toggleChapter = chapter => {
    const exists = row.chapters.some(item => same(item.chapter, chapter.name));
    const chapters = exists ? row.chapters.filter(item => !same(item.chapter, chapter.name)) : [...row.chapters, { chapter: chapter.name, topics: [...chapter.topics] }];
    onChange({ ...row, chapters: selected.chapters.flatMap(item => chapters.filter(chapter => same(chapter.chapter, item.name))) });
  };
  return <fieldset className="adm-question quiz-subject-editor"><legend>Subject {index + 1}</legend>
    <div className="quiz-editor-line"><label>Subject from curriculum<select aria-label={`Subject ${index + 1} from curriculum`} value={manual ? "custom" : selected?.id || ""} disabled={loading} onChange={event => chooseSubject(event.target.value)}><option value="" disabled>{loading ? "Loading subjects..." : "Choose a subject — topics load automatically"}</option>{catalog.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}<option value="custom">Custom college syllabus / write manually</option></select></label><button type="button" className="adm-icon-button adm-danger-text" disabled={!canRemove} aria-label={`Remove subject ${index + 1}`} onClick={onRemove}><Trash2 size={17} /></button></div>
    {selected && !manual && <>
      <div className="quiz-autofill-actions"><p role="status">{row.chapters.length} chapters · {row.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0)} topics selected automatically</p><button type="button" className="adm-button adm-button-secondary" onClick={() => onChange(fromCatalog(selected))}><CheckCheck size={15} />Select all chapters & topics</button><button type="button" className="adm-button adm-button-secondary" onClick={() => onChange({ ...row, chapters: [] })}>Clear selection</button></div>
      <div className="quiz-curriculum-chapters">{selected.chapters.map(chapter => {
        const saved = row.chapters.find(item => same(item.chapter, chapter.name));
        return <div className="quiz-curriculum-chapter" key={chapter.name}>
          <label className="quiz-checkbox"><input type="checkbox" aria-label={`Include ${chapter.name} in ${row.subject}`} checked={!!saved} onChange={() => toggleChapter(chapter)} /><strong>{chapter.name}</strong><span>{chapter.topics.length} topics</span></label>
          {saved && <div className="quiz-curriculum-topics">{chapter.topics.map(topic => <label className="quiz-checkbox" key={topic}><input type="checkbox" aria-label={`${chapter.name}: ${topic}`} checked={saved.topics.includes(topic)} onChange={() => onChange({ ...row, chapters: row.chapters.map(item => item === saved ? { ...item, topics: item.topics.includes(topic) ? item.topics.filter(value => value !== topic) : [...item.topics, topic] } : item) })} />{topic}</label>)}{!saved.topics.length && <p className="quiz-error">Select at least one topic or remove this chapter.</p>}</div>}
        </div>;
      })}</div>
      {!row.chapters.length && <p className="quiz-error">Select at least one chapter for this subject.</p>}
      <button type="button" className="adm-button adm-button-secondary" onClick={() => setCustom(true)}>Customize subject, chapter or topic text</button>
    </>}
    {manual && <>
      <label>Subject name<input required maxLength={120} value={row.subject} onChange={event => onChange({ ...row, subject: event.target.value })} placeholder="Your college subject name" /></label>
      {row.chapters.map((chapter, ci) => <div className="quiz-chapter-editor" key={ci}>
        <div className="quiz-editor-line"><label>Chapter {ci + 1}<input required maxLength={160} value={chapter.chapter} onChange={event => updateChapter(ci, { chapter: event.target.value })} /></label><button type="button" className="adm-icon-button adm-danger-text" disabled={row.chapters.length === 1} aria-label={`Remove chapter ${ci + 1} of subject ${index + 1}`} onClick={() => onChange({ ...row, chapters: row.chapters.filter((_, i) => i !== ci) })}><Trash2 size={16} /></button></div>
        {chapter.topics.map((topic, ti) => <div className="quiz-editor-line" key={ti}><label>Topic {ti + 1}<input required maxLength={300} value={topic} onChange={event => updateChapter(ci, { topics: chapter.topics.map((value, i) => i === ti ? event.target.value : value) })} /></label><button type="button" className="adm-icon-button adm-danger-text" disabled={chapter.topics.length === 1} aria-label={`Remove topic ${ti + 1} from chapter ${ci + 1} of subject ${index + 1}`} onClick={() => updateChapter(ci, { topics: chapter.topics.filter((_, i) => i !== ti) })}><Trash2 size={15} /></button></div>)}
        <button type="button" className="adm-button adm-button-secondary" disabled={chapter.topics.length >= 50} onClick={() => updateChapter(ci, { topics: [...chapter.topics, ""] })}><Plus size={14} />Add custom topic</button>
      </div>)}
      <button type="button" className="adm-button adm-button-secondary" disabled={row.chapters.length >= 30} onClick={() => onChange({ ...row, chapters: [...row.chapters, blankChapter()] })}><Plus size={15} />Add custom chapter</button>
    </>}
  </fieldset>;
}

export default function QuizSyllabusEditor({ group, syllabus, onChange }) {
  const state = useAdminData("/admin/curriculum?group=all");
  // Keep already selected subjects editable when the quiz audience changes.
  const all = state.data?.subjects || [];
  const catalog = all.filter(subject => group === "all" || subject.groups.includes(group) || syllabus.some(row => same(row.subject, subject.name)));
  return <section className="quiz-autofill" aria-label="Subject chapter and topic syllabus">
    <div><h3>Subject → chapter → topic</h3><p>Choose a subject to add its chapters and topics automatically. Keep only the chapters and topics included in your college syllabus.</p></div>
    {state.error && <p role="alert" className="quiz-error">{state.error} <button type="button" className="adm-button adm-button-secondary" onClick={state.reload}>Retry loading subjects</button></p>}
    {syllabus.map((row, index) => <SubjectEditor key={index} row={row} index={index} catalog={catalog.filter(subject => same(row.subject, subject.name) || !syllabus.some(other => same(other.subject, subject.name)))} loading={state.loading} onChange={value => onChange(syllabus.map((subject, i) => i === index ? value : subject))} canRemove={syllabus.length > 1} onRemove={() => onChange(syllabus.filter((_, i) => i !== index))} />)}
    <button type="button" className="adm-button adm-button-secondary" disabled={syllabus.length >= 20} onClick={() => onChange([...syllabus, blankSubject()])}><Plus size={16} />Add another subject</button>
  </section>;
}
