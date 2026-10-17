export default function QuizSyllabus({ syllabus, progress, onToggle, onToggleTopic, savingKey }) {
  const doneChapters = new Set(progress?.completedKeys || []);
  const doneTopics = new Set(progress?.completedTopicKeys || []);
  return <div className="quiz-syllabus">{syllabus.map((subject, index) => {
    const totalTopics = subject.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
    const completedTopics = subject.chapters.reduce((sum, chapter) => sum + (chapter.topicKeys || []).filter(key => doneTopics.has(key)).length, 0);
    const completedChapters = subject.chapters.filter(chapter => doneChapters.has(chapter.key)).length;
    const percentage = totalTopics ? Math.round(completedTopics / totalTopics * 100) : 0;
    return <details key={index} open><summary>{subject.subject}<span>{onToggle ? `${percentage}% complete` : `${subject.chapters.length} ${subject.chapters.length === 1 ? "chapter" : "chapters"}`}</span></summary>
      {onToggle && <div className="quiz-subject-progress"><p>{completedChapters}/{subject.chapters.length} chapters · {completedTopics}/{totalTopics} topics complete</p><progress value={percentage} max={100} aria-label={`${subject.subject} preparation progress`}>{percentage}%</progress></div>}
      {subject.chapters.map((chapter, chapterIndex) => {
        const completed = doneChapters.has(chapter.key);
        const selectedTopics = (chapter.topicKeys || []).filter(key => doneTopics.has(key)).length;
        return <div className={`quiz-syllabus-chapter${completed ? " is-complete" : ""}`} key={chapter.key || chapterIndex}>
          {onToggle ? <><label className="quiz-chapter-check"><input type="checkbox" checked={completed} ref={element => { if (element) element.indeterminate = selectedTopics > 0 && !completed; }} disabled={!!savingKey} onChange={event => onToggle(chapter.key, event.target.checked)} aria-label={`Complete ${subject.subject}: ${chapter.chapter}`} /><span className={completed ? "quiz-completed-text" : undefined}>{chapter.chapter}</span><strong>{savingKey === chapter.key ? "Saving..." : completed ? "Complete" : "Mark complete"}</strong></label><p className="quiz-chapter-topic-count">{selectedTopics}/{chapter.topics.length} topics complete</p></> : <h4>{chapter.chapter}</h4>}
          <ul className={onToggleTopic ? "quiz-topic-checklist" : undefined}>{chapter.topics.map((topic, topicIndex) => {
            const key = chapter.topicKeys?.[topicIndex];
            const topicCompleted = doneTopics.has(key);
            return <li key={key || topicIndex}>{onToggleTopic ? <label className="quiz-topic-check"><input type="checkbox" checked={topicCompleted} disabled={!!savingKey || !key} onChange={event => onToggleTopic(chapter.key, key, event.target.checked)} aria-label={`Complete topic ${subject.subject}: ${chapter.chapter}: ${topic}`} /><span className={topicCompleted ? "quiz-completed-text" : undefined}>{topic}</span>{savingKey === key && <small>Saving...</small>}</label> : topic}</li>;
          })}</ul>
        </div>;
      })}
    </details>;
  })}</div>;
}
