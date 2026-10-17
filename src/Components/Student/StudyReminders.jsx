import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";
import useStudyClock from "./useStudyClock";
import { reminderCandidates } from "./study-time.mjs";

export default function StudyReminders() {
  const { user, role, profile } = useContext(AuthContext);
  const enabled = !!user && role === "student" && profile?.profileComplete;
  const [records, setRecords] = useState(null);
  const seen = useRef({ uid: null, keys: new Set() });
  const now = useStudyClock();
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let busy = false, queued = false;
    const load = async () => {
      if (controller.signal.aborted || document.visibilityState === "hidden") return;
      if (busy) { queued = true; return; }
      busy = true;
      try {
        const [classes, tasks] = await Promise.all([authenticatedRequest(user, "/classes", { signal: controller.signal }), authenticatedRequest(user, "/study-tasks", { signal: controller.signal })]);
        if (!controller.signal.aborted) setRecords({ uid: user.uid, classes, tasks });
      } catch { /* Existing page errors and account verification handle unavailable APIs. */ }
      finally { busy = false; if (queued && !controller.signal.aborted) { queued = false; load(); } }
    };
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener("toolkit:study-changed", load);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener("toolkit:study-changed", load); window.removeEventListener("focus", load); document.removeEventListener("visibilitychange", load); };
  }, [enabled, user]);

  useEffect(() => {
    if (!enabled || records?.uid !== user.uid || document.visibilityState === "hidden") return;
    const storageKey = `toolkit-study-reminders:${user.uid}`;
    if (seen.current.uid !== user.uid) {
      let saved = [];
      try { const data = JSON.parse(localStorage.getItem(storageKey) || "[]"); if (Array.isArray(data)) saved = data.filter(key => typeof key === "string").slice(-300); } catch { /* Optional persistence. */ }
      seen.current = { uid: user.uid, keys: new Set(saved) };
    }
    for (const reminder of reminderCandidates(records.classes, records.tasks, now)) {
      if (seen.current.keys.has(reminder.key)) continue;
      seen.current.keys.add(reminder.key);
      toast(reminder.message, { id: reminder.key, icon: "⏰", duration: 8000 });
      const keys = [...seen.current.keys].slice(-300);
      seen.current.keys = new Set(keys);
      try { localStorage.setItem(storageKey, JSON.stringify(keys)); } catch { /* In-memory deduplication still works. */ }
    }
  }, [enabled, now, records, user]);
  return null;
}
