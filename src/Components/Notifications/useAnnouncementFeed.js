import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { authenticatedRequest } from "../../api";

const POLL_INTERVAL = 10000;
const announcementVersion = (item) => `${item.id}:${item.version || item.publishedAt || item.updatedAt || ""}`;
const notificationErrorMessage = (error, fallback) => error.status === 404
  ? "The notification API was not found on this server. The server needs the latest update."
  : error.message || fallback;

export function useAnnouncementFeed(user, refreshRole, kind = "announcement") {
  const path = kind === "quiz" ? "/student/quiz-updates/notifications" : "/content/announcements";
  const navigate = useNavigate();
  const [feed, setFeed] = useState({ uid: null, items: [], loading: !!user, error: null });
  const [revision, setRevision] = useState(0);
  const known = useRef({ uid: null, ids: new Set() });
  const mutations = useRef({ sequence: 0, pending: 0 });

  useEffect(() => {
    if (!user) {
      setFeed({ uid: null, items: [], loading: false, error: null });
      known.current = { uid: null, ids: new Set() };
      return undefined;
    }
    let active = true;
    let inFlight = false;
    let timer;
    let controller;
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      const sequence = mutations.current.sequence;
      controller = new AbortController();
      try {
        const items = await authenticatedRequest(user, path, { signal: controller.signal });
        if (!active || sequence !== mutations.current.sequence || mutations.current.pending) return;
        const firstLoad = known.current.uid !== user.uid;
        const knownIds = firstLoad ? new Set() : known.current.ids;
        if (!firstLoad) {
          for (const item of items) {
            const version = announcementVersion(item);
            if (!knownIds.has(version) && !item.read && !item.dismissed) {
              if (kind === "quiz") toast(t => createElement("button", { type: "button", onClick: () => { toast.dismiss(t.id); navigate(item.target); }, style: { cursor: "pointer", textAlign: "left" } }, `Quiz update: ${item.title} — View syllabus & tracker`), { icon: "📚", duration: 8000 });
              else toast(`New announcement: ${item.title}`, { icon: "📢", duration: 5000 });
            }
          }
        }
        for (const item of items) knownIds.add(announcementVersion(item));
        known.current = { uid: user.uid, ids: knownIds };
        setFeed({ uid: user.uid, items, loading: false, error: null });
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setFeed((previous) => ({ uid: user.uid, items: previous.uid === user.uid ? previous.items : [], loading: false, error: notificationErrorMessage(error, "Could not load announcements.") }));
          if ([401, 403].includes(error.status)) refreshRole();
        }
      } finally {
        inFlight = false;
        if (active) timer = setTimeout(refresh, POLL_INTERVAL);
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        refresh();
      }
    };
    refresh();
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [revision, user, refreshRole, path, kind, navigate]);

  const updateReadState = useCallback(async (id, action) => {
    const current = feed.items.find((item) => item.id === id);
    if (!user || !current || action === "read" && current.read || action === "dismiss" && current.dismissed) return;
    mutations.current.sequence++; mutations.current.pending++;
    setFeed((previous) => ({
      ...previous,
      items: previous.items.map((item) => item.id === id ? { ...item, read: true, ...(action === "dismiss" ? { dismissed: true } : {}) } : item),
    }));
    try {
      await authenticatedRequest(user, `${path}/${encodeURIComponent(id)}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: current.version }) });
    } catch (error) {
      setFeed((previous) => ({
        ...previous,
        items: previous.items.map((item) => item.id === id && announcementVersion(item) === announcementVersion(current) ? current : item),
      }));
      toast.error(notificationErrorMessage(error, action === "dismiss" ? "Could not remove this notification." : "Could not mark announcement as read."));
      if ([401, 403].includes(error.status)) refreshRole();
    } finally { mutations.current.pending--; mutations.current.sequence++; }
  }, [feed.items, refreshRole, user, path]);

  const markRead = useCallback((id) => updateReadState(id, "read"), [updateReadState]);
  const dismiss = useCallback((id) => updateReadState(id, "dismiss"), [updateReadState]);
  const markAllRead = useCallback(async () => {
    if (!user || !feed.items.some((item) => !item.read)) return;
    mutations.current.sequence++; mutations.current.pending++;
    const previous = feed.items;
    setFeed((value) => ({ ...value, items: value.items.map((item) => ({ ...item, read: true })) }));
    try {
      await authenticatedRequest(user, `${path}/read-all`, { method: "POST" });
    } catch (error) {
      setFeed((value) => ({ ...value, items: previous }));
      toast.error(notificationErrorMessage(error, "Could not mark announcements as read."));
      if ([401, 403].includes(error.status)) refreshRole();
    } finally { mutations.current.pending--; mutations.current.sequence++; }
  }, [feed.items, refreshRole, user, path]);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  const current = feed.uid === user?.uid ? feed : { uid: user?.uid || null, items: [], loading: !!user, error: null };
  return {
    ...current,
    unreadCount: current.items.filter((item) => !item.read && !item.dismissed).length,
    markRead,
    dismiss,
    markAllRead,
    retry,
  };
}
