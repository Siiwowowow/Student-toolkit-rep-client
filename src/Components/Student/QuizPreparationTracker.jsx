import { useState } from "react";
import toast from "react-hot-toast";
import QuizSyllabus from "./QuizSyllabus";

export default function QuizPreparationTracker({ item, onSave }) {
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState("");
  const progress = item.progress || { completedKeys: [], completedTopicKeys: [], completed: 0, total: item.syllabus.reduce((sum, subject) => sum + subject.chapters.length, 0), completedTopics: 0, totalTopics: item.syllabus.reduce((sum, subject) => sum + subject.chapters.reduce((total, chapter) => total + chapter.topics.length, 0), 0), percentage: 0 };
  const toggle = async (key, completed, topicKey) => {
    setSavingKey(topicKey || key); setError("");
    try { await onSave(item.id, key, completed, topicKey); }
    catch (failure) { setError(failure.message); toast.error("Study progress was not saved. Please try again."); }
    finally { setSavingKey(null); }
  };
  return <section className="quiz-preparation-tracker" aria-label={`${item.title} preparation tracker`}>
    <div className="quiz-progress-heading"><div><h3>Preparation progress</h3><p>{progress.completed} of {progress.total} chapters · {progress.completedTopics} of {progress.totalTopics} topics complete</p></div><strong>{progress.percentage}%</strong></div>
    <progress value={progress.percentage} max={100} aria-label={`${item.title} preparation progress`}>{progress.percentage}%</progress>
    <p className="quiz-tracker-help">Tick a topic after studying, or tick a chapter to complete all its topics. Progress is based on completed topics and saved to your profile.</p>
    {error && <p className="quiz-error" role="alert">{error}</p>}
    <QuizSyllabus syllabus={item.syllabus} progress={progress} onToggle={toggle} onToggleTopic={(chapterKey, topicKey, completed) => toggle(chapterKey, completed, topicKey)} savingKey={savingKey} />
  </section>;
}
