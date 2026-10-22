import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { AuthContext } from "../../Context/AuthContext";
import { isActive, restoreSession, returnToFocus, transition } from "./focus-session.mjs";
import { flushFocusHistory, queueFocusHistory } from "./focus-history-store";

// The controller lives above the routes so watching a class keeps the same session.
// eslint-disable-next-line react-refresh/only-export-components
export const FocusSessionContext = createContext(null);

function SessionController({ user, children }) {
  const storageKey = `toolkit-focus-v1:${user.uid}`;
  const { pathname } = useLocation();
  const studyRoute = pathname === "/focus-mode" || pathname === "/focus-study-mood";
  const studyRouteRef = useRef(studyRoute);
  const [session, setSession] = useState(() => {
    try { return restoreSession(localStorage.getItem(storageKey)); } catch { return null; }
  });
  const sessionRef = useRef(session);
  const [now, setNow] = useState(Date.now);
  const [storageError, setStorageError] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const lastHistory = useRef(null);
  const persistHistory = useCallback((next, force = false) => {
    if (!next) return true;
    const timestamp = Date.now();
    const id = next.id || `legacy-${next.startedAt}`;
    const last = lastHistory.current;
    if (!force && last?.id === id && last.status === next.status && (!isActive(next) || timestamp - last.at < 15000)) return true;
    try {
      queueFocusHistory(user, next, timestamp);
      lastHistory.current = { id, status: next.status, at: timestamp };
      flushFocusHistory(user).then(() => setHistoryError("")).catch(() => setHistoryError("Your focus history is saved on this device and is waiting to sync. Keep this browser data until sync finishes."));
      return true;
    } catch {
      setHistoryError("Focus history could not be saved. Your session has been kept. Free browser storage and try again.");
      return false;
    }
  }, [user]);

  const update = useCallback((next) => {
    sessionRef.current = next;
    setSession(next);
    setNow(Date.now());
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { setStorageError(true); }
    persistHistory(next);
  }, [storageKey, persistHistory]);

  useEffect(() => {
    studyRouteRef.current = studyRoute;
    const timestamp = Date.now();
    update(studyRoute
      ? returnToFocus(sessionRef.current, timestamp, !document.hidden, document.hasFocus())
      : transition(sessionRef.current, "pause", timestamp, "Left the study routes"));
  }, [studyRoute, update]);

  useEffect(() => {
    // Iframe controls and fullscreen are part of the classroom, not interruptions.
    const inClassroom = () => !document.hidden && document.hasFocus();
    const tick = () => {
      const timestamp = Date.now();
      let next = sessionRef.current;
      if (isActive(next)) {
        next = studyRouteRef.current && inClassroom()
          ? returnToFocus(transition(next, "tick", timestamp), timestamp, true, true)
          : transition(next, "pause", timestamp, "Left the study routes, minimized browser, or switched apps");
        next = { ...next, lastSeen: timestamp };
      }
      update(next);
    };
    const onBlur = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(tick, 0);
    };
    let blurTimer;
    const onPageHide = () => {
      // Only confirmed navigation/close ends the session. Canceling the warning keeps it.
      const timestamp = Date.now();
      update(transition(sessionRef.current, "finish", timestamp));
      persistHistory(sessionRef.current, true);
    };
    const retryHistory = () => flushFocusHistory(user).then(() => setHistoryError("")).catch(() => setHistoryError("Your saved focus history is waiting to sync."));
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", tick);
    window.addEventListener("pageshow", tick);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", retryHistory);
    retryHistory();
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => {
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", tick);
      window.removeEventListener("pageshow", tick);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("online", retryHistory);
      window.clearTimeout(blurTimer);
      window.clearInterval(interval);
    };
  }, [update, persistHistory, user]);

  const active = isActive(session);
  useEffect(() => {
    if (!active) return;
    const warn = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);

  return <FocusSessionContext.Provider value={{ session, sessionRef, now, storageError, historyError, lastHistory, persistHistory, update }}>{children}</FocusSessionContext.Provider>;
}

export default function FocusSessionProvider({ children }) {
  const { user } = useContext(AuthContext);
  return user ? <SessionController key={user.uid} user={user}>{children}</SessionController> : children;
}
