import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";
import { createQuizProgressQueue } from "./quiz-progress.mjs";

export default function useQuizUpdates() {
  const { user, role, profile, refreshRole } = useContext(AuthContext);
  const enabled = !!user && role === "student" && profile?.profileComplete;
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const writes = useRef({ sequence: 0, pending: 0 });
  const saveQueues = useRef(new Map());
  const key = `${user?.uid}:${JSON.stringify(profile?.academicProfile)}:${revision}`;
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let busy = false, queued = false;
    const load = async () => {
      if (controller.signal.aborted || document.visibilityState === "hidden") return;
      if (busy) { queued = true; return; }
      busy = true;
      const sequence = writes.current.sequence;
      try {
        const items = await authenticatedRequest(user, "/student/quiz-updates", { signal: controller.signal });
        if (!controller.signal.aborted && sequence === writes.current.sequence && !writes.current.pending) setResult({ key, items });
      } catch (error) {
        if (!controller.signal.aborted && sequence === writes.current.sequence && !writes.current.pending) {
          setResult({ key, error: error.message });
          if ([401, 403].includes(error.status)) refreshRole();
        }
      } finally { busy = false; if (queued && !controller.signal.aborted) { queued = false; load(); } }
    };
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener("focus", load); document.removeEventListener("visibilitychange", load); };
  }, [enabled, user, key, refreshRole]);
  const current = enabled && result?.key === key ? result : null;
  const saveChapter = useCallback(async (id, chapterKey, completed, topicKey) => {
    const item = result?.key === key && result.items?.find(item => item.id === id);
    if (!item) throw new Error("Reload the quiz before updating your progress.");
    let enqueue = saveQueues.current.get(key);
    if (!enqueue) {
      enqueue = createQuizProgressQueue({
        save: (quizId, change) => authenticatedRequest(user, `/student/quiz-updates/${encodeURIComponent(quizId)}/progress`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(change) }),
        onChange: (quizId, progress) => setResult(previous => previous?.key === key ? { ...previous, items: (previous.items || []).map(item => item.id === quizId ? { ...item, progress } : item) } : previous),
      });
      saveQueues.current.set(key, enqueue);
    }
    writes.current.sequence++; writes.current.pending++;
    try {
      return await enqueue(item, { chapterKey, completed, topicKey });
    } finally { writes.current.pending--; writes.current.sequence++; }
  }, [user, key, result]);
  return { items: current?.items || [], loading: enabled && !current, error: current?.error, reload: () => setRevision(value => value + 1), saveChapter };
}
