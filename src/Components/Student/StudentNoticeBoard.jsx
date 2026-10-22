import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bell, CheckCheck, Clock3, Megaphone } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import { NotificationContext } from "../Notifications/notification-context";
import { noticeUrl } from "./notice-routes.mjs";

const shortDate = (value) => {
  const date = new Date(value || NaN);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric" }).format(date);
};

export default function StudentNoticeBoard() {
  const { user } = useContext(AuthContext);
  const feed = useContext(NotificationContext);
  const notices = feed.announcementFeed;
  const markRead = notices.markRead;
  const location = useLocation();
  const navigate = useNavigate();
  const readAttempted = useRef(null);
  const [filter, setFilter] = useState("all");
  const selectedId = new URLSearchParams(location.search).get("announcement");
  const announcements = useMemo(() => [...feed.announcements].sort((left, right) =>
    new Date(right.publishedAt || right.updatedAt || 0) - new Date(left.publishedAt || left.updatedAt || 0)), [feed.announcements]);
  const visible = announcements.filter((item) => item.id === selectedId || filter === "all" ||
    filter === "unread" && !item.read && !item.dismissed || filter === "important" && item.priority === "important");

  useEffect(() => {
    if (!selectedId) { readAttempted.current = null; return; }
    const selected = announcements.find((item) => item.id === selectedId);
    if (!selected) return;
    document.getElementById(`notice-${selectedId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const key = `${user.uid}:${selectedId}:${selected.publishedAt || selected.updatedAt || ""}`;
    if (readAttempted.current !== key) {
      readAttempted.current = key;
      markRead(selectedId);
    }
  }, [announcements, markRead, selectedId, user.uid]);

  return <>
    <section className="student-notice-board" id="notice-board" aria-labelledby="student-notice-title">
      <header><div><span><Megaphone size={17} /> TOOLKIT COMMUNITY</span><h1 id="student-notice-title">Notice board</h1><p>Published announcements from your administrator, newest first.</p></div><span className="student-notice-count">{announcements.length} {announcements.length === 1 ? "notice" : "notices"}</span></header>
      <div className="std-notice-toolbar"><div role="group" aria-label="Filter notices">{["all", "unread", "important"].map((value) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "All updates" : value === "unread" ? `Unread (${notices.unreadCount})` : "Important"}</button>)}</div><button disabled={!notices.unreadCount} onClick={notices.markAllRead}><CheckCheck size={14} /> Mark all read</button></div>
      {notices.loading && <div className="student-notice-state" role="status"><span className="loading loading-spinner" />Loading notices...</div>}
      {notices.error && <div className="student-notice-error" role="alert"><p>{notices.error}</p><button type="button" onClick={notices.retry}>Try again</button></div>}
      {!notices.loading && !notices.error && !announcements.length && <div className="student-notice-state"><Bell size={29} /><strong>No announcements yet</strong><span>Published notices will appear here.</span></div>}
      {!!visible.length && <div className="student-notice-list">{visible.map((item) => <article key={item.id} id={`notice-${item.id}`} className={`student-notice-card${item.id === selectedId ? " is-selected" : ""}${item.read ? " is-read" : " is-unread"}`}><button type="button" className="student-notice-open" onClick={() => navigate(noticeUrl(item.id))} aria-expanded={item.id === selectedId}><span className="student-notice-meta"><time dateTime={item.publishedAt || item.updatedAt}>{shortDate(item.publishedAt || item.updatedAt)}</time>{item.priority === "important" && <span className="student-notice-important">Important</span>}{!item.read && <span className="student-notice-new">New</span>}</span><strong>{item.title}</strong><span className="student-notice-body">{item.body}</span></button></article>)}</div>}
      {!!announcements.length && !visible.length && <p className="std-empty">No notices in this view. You are up to date.</p>}
      {selectedId && !announcements.some((item) => item.id === selectedId) && !notices.loading && !notices.error && <p className="student-notice-missing">This announcement is no longer available.</p>}
    </section>
    <footer className="student-dashboard-updated"><Clock3 size={14} /> Notices refresh automatically while you are online.</footer>
  </>;
}
