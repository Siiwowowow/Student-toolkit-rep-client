import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";
import "./PublishedQuizzes.css";

export default function PublishedQuizzes() {
  const { user } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [opening, setOpening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState("");
  const key = `${user?.uid}:${revision}`;
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    authenticatedRequest(user, "/content/quizzes", { signal: controller.signal }).then((items) => { if (!controller.signal.aborted) setResult({ key, items }); }).catch((error) => { if (!controller.signal.aborted) setResult({ key, error: error.message }); });
    return () => controller.abort();
  }, [user, key]);
  const open = async (id) => {
    setOpening(true); setError("");
    try { const item = await authenticatedRequest(user, `/content/quizzes/${encodeURIComponent(id)}`); setQuiz({ owner: user.uid, ...item }); setAnswers({}); setSubmitted(false); }
    catch (error) { setError(error.message); } finally { setOpening(false); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError("");
    try {
      const saved = await authenticatedRequest(user, "/student/quiz-attempts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quizId: quiz.id, answers }) });
      setAssessment(saved);
      setSubmitted(true);
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  };
  const current = result?.key === key ? result : null;
  const activeQuiz = quiz?.owner === user?.uid ? quiz : null;
  const questions = activeQuiz ? ["mcq", "trueFalse", "short"].flatMap((type) => (activeQuiz.questions[type] || []).map((item, index) => ({ ...item, type, key: `${type}-${index}` }))) : [];
  const correct = (row) => String(row.type === "mcq" ? row.correct : row.answer).trim().toLowerCase() === String(answers[row.key] ?? "").trim().toLowerCase();
  return <section className="published-quizzes" aria-label="Published practice quizzes"><div className="pq-heading"><span><BookOpenCheck size={23} /><strong>Toolkit practice quizzes</strong></span><small>Curated by your admin</small></div>{!user ? <p className="pq-note"><Link to="/logIn">Sign in</Link> to practice published quizzes.</p> : activeQuiz ? <><button type="button" className="pq-back" onClick={() => setQuiz(null)}><ArrowLeft size={15} />Back to quizzes</button><h2>{activeQuiz.topic}</h2><p className="pq-note">{activeQuiz.description || "Practice at your own pace. Answers are shown after you check your work."}</p>{error && <p className="pq-error" role="alert">{error}</p>}<form onSubmit={submit}>{questions.map((row, index) => <fieldset className="pq-question" key={row.key} disabled={submitted || saving}><legend>Question {index + 1}</legend><p>{row.question}</p>{row.type === "short" ? <label>Your answer<input required maxLength={2000} value={answers[row.key] || ""} onChange={(event) => setAnswers((previous) => ({ ...previous, [row.key]: event.target.value }))} /></label> : (row.type === "mcq" ? row.options : ["true", "false"]).map((option) => <label className="pq-option" key={option}><input type="radio" required name={row.key} value={option} checked={answers[row.key] === option} onChange={() => setAnswers((previous) => ({ ...previous, [row.key]: option }))} /><span>{row.type === "trueFalse" ? option === "true" ? "True" : "False" : option}</span></label>)}{submitted && <div className={`pq-feedback${correct(row) ? " is-correct" : ""}`}>{correct(row) ? "Correct!" : `Correct answer: ${String(row.type === "mcq" ? row.correct : row.answer)}`}</div>}</fieldset>)}{submitted ? <div className="pq-result" role="status"><CheckCircle2 size={22} /><strong>{assessment?.correct ?? questions.filter(correct).length} of {assessment?.total ?? questions.length} correct</strong><button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }}>Try again</button></div> : <button className="pq-start" type="submit" disabled={saving}>{saving ? "Saving result..." : "Check my answers"}<ArrowRight size={16} /></button>}</form></> : !current ? <p className="pq-note" role="status">Loading practice quizzes...</p> : current.error ? <div role="alert"><p className="pq-note">Could not load quizzes.</p><button type="button" className="pq-back" onClick={() => setRevision((value) => value + 1)}>Try again</button></div> : !current.items.length ? <p className="pq-note">Published quizzes will appear here when your admin shares them.</p> : <><div className="pq-grid">{current.items.map((item) => <article key={item.id}><span>{item.questionCount} questions</span><h3>{item.topic}</h3><p>{item.description || "A toolkit practice quiz."}</p><button type="button" className="pq-start" disabled={opening} onClick={() => open(item.id)}>Start practice<ArrowRight size={15} /></button></article>)}</div>{error && <p className="pq-error" role="alert">{error}</p>}</>}</section>;
}
