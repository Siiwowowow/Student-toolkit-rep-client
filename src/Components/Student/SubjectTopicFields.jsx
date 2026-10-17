export default function SubjectTopicFields({ subjects, subject, topic, onSubject, onTopic, fieldClass = "", loading = false, error, retry }) {
  const selected = subjects.find((item) => item.name === subject);
  return <>
    <label className="subject-topic-field"><span>Subject *</span><select aria-label="Subject" className={fieldClass} required value={selected ? subject : ""} disabled={loading || !!error} onChange={(event) => onSubject(event.target.value)}><option value="">{loading ? "Loading your subjects…" : "Choose a subject"}</option>{subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
    <label className="subject-topic-field"><span>Topic *</span><select aria-label="Topic" className={fieldClass} required value={topic} disabled={!selected || loading} onChange={(event) => onTopic(event.target.value)}><option value="">{selected ? "Choose a topic" : "Select a subject first"}</option>{selected?.chapters.map((chapter) => <optgroup key={chapter.name} label={chapter.name}>{chapter.topics.map((item) => <option key={item} value={`${chapter.name} — ${item}`}>{item}</option>)}</optgroup>)}</select></label>
    {error && <div role="alert" className="curriculum-error">{error} <button type="button" onClick={retry}>Try again</button></div>}
  </>;
}
