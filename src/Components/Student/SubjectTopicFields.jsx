import { useId } from "react";
import { MAX_TOPICS } from "./topic-selection.mjs";
import "./SubjectTopicFields.css";

export default function SubjectTopicFields({ subjects, subject, topics = [], onSubject, onTopics, fieldClass = "", loading = false, error, retry }) {
  const id = useId();
  const selected = subjects.find((item) => item.name === subject);
  const values = topics.length ? topics : [""];
  const allowed = new Set(selected?.chapters.flatMap((chapter) => chapter.topics.map((topic) => `${chapter.name} — ${topic}`)) || []);
  const updateTopic = (index, value) => onTopics(values.map((topic, topicIndex) => topicIndex === index ? value : topic));
  return <>
    <label className="subject-topic-field"><span>Subject *</span><select aria-label="Subject" className={fieldClass} required value={selected ? subject : ""} disabled={loading || !!error} onChange={(event) => onSubject(event.target.value)}><option value="">{loading ? "Loading your subjects…" : "Choose a subject"}</option>{subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
    <fieldset className="subject-topic-field subject-topic-multi" disabled={!selected || loading || !!error} aria-describedby={`${id}-help`}>
      <legend>Topics *</legend>
      <p id={`${id}-help`}>Choose one or more topics. Add another topic to include more chapters.</p>
      {values.map((value, index) => <div className="subject-topic-row" key={index}>
        <select aria-label={`Topic ${index + 1}`} className={fieldClass} required value={value} onChange={(event) => updateTopic(index, event.target.value)}>
          <option value="">{selected ? "Choose a topic" : "Select a subject first"}</option>
          {value && !allowed.has(value) && <option value={value} disabled>{value} (choose an available topic)</option>}
          {selected?.chapters.map((chapter) => <optgroup key={chapter.name} label={chapter.name}>{chapter.topics.map((topic) => {
            const label = `${chapter.name} — ${topic}`;
            return <option key={topic} value={label} disabled={value !== label && values.includes(label)}>{topic}</option>;
          })}</optgroup>)}
        </select>
        {values.length > 1 && <button type="button" className="subject-topic-remove" aria-label={`Remove topic ${index + 1}`} onClick={() => onTopics(values.filter((_, topicIndex) => topicIndex !== index))}>×</button>}
      </div>)}
      <button type="button" className="subject-topic-add" disabled={values.some((value) => !allowed.has(value)) || values.length >= Math.min(allowed.size, MAX_TOPICS)} onClick={() => onTopics([...values, ""])}>+ Add another topic</button>
    </fieldset>
    {error && <div role="alert" className="curriculum-error">{error} <button type="button" onClick={retry}>Try again</button></div>}
  </>;
}
