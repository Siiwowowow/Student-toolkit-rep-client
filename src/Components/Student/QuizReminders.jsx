import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import useQuizUpdates from "./useQuizUpdates";
import useStudyClock from "./useStudyClock";
import { quizCountdown, quizReminderCandidates } from "./quiz-time.mjs";

export default function QuizReminders() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { items } = useQuizUpdates();
  const now = useStudyClock();
  const seen = useRef({ uid: null, keys: new Set() });
  useEffect(() => {
    if (!user || document.visibilityState === "hidden") return;
    const storageKey = `toolkit-quiz-reminders:${user.uid}`;
    if (seen.current.uid !== user.uid) {
      let keys = [];
      try { const saved = JSON.parse(localStorage.getItem(storageKey) || "[]"); if (Array.isArray(saved)) keys = saved.filter(key => typeof key === "string").slice(-300); } catch { /* Optional persistence. */ }
      seen.current = { uid: user.uid, keys: new Set(keys) };
    }
    for (const item of quizReminderCandidates(items, now)) {
      if (seen.current.keys.has(item.reminderKey)) continue;
      seen.current.keys.add(item.reminderKey);
      toast(t => <div><strong>{item.title}</strong><p>Quiz in {quizCountdown(item.quizAt, now)}</p><button type="button" style={{ color: "#007f79", textDecoration: "underline", cursor: "pointer" }} onClick={() => { toast.dismiss(t.id); navigate(`/student-dashboard/quiz-updates#quiz-${item.id}`); }}>View syllabus</button></div>, { id: item.reminderKey, icon: "⏰", duration: 12000 });
      const keys = [...seen.current.keys].slice(-300);
      seen.current.keys = new Set(keys);
      try { localStorage.setItem(storageKey, JSON.stringify(keys)); } catch { /* In-memory deduplication still works. */ }
    }
  }, [items, now, user, navigate]);
  return null;
}
