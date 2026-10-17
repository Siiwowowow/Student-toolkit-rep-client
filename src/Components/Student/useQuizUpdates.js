import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";

export default function useQuizUpdates() {
  const { user, role, profile, refreshRole } = useContext(AuthContext);
  const enabled = !!user && role === "student" && profile?.profileComplete;
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const writes = useRef({ sequence: 0, pending: 0 });
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
    writes.current.sequence++; writes.current.pending++;
    try {
      const progress = await authenticatedRequest(user, `/student/quiz-updates/${encodeURIComponent(id)}/progress`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterKey, completed, topicKey }) });
      setResult(previous => previous?.key === key ? { ...previous, items: (previous.items || []).map(item => item.id === id ? { ...item, progress } : item) } : previous);
      return progress;
    } finally { writes.current.pending--; writes.current.sequence++; }
  }, [user, key]);
  return { items: current?.items || [], loading: enabled && !current, error: current?.error, reload: () => setRevision(value => value + 1), saveChapter };
}
