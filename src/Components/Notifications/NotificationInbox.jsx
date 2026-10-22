import { Link } from "react-router";
import { Bell, X } from "lucide-react";
import { noticeUrl } from "../Student/notice-routes.mjs";

const compactDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "2-digit" }).format(date);
};

export default function NotificationInbox({ user, feed, onNavigate }) {
  if (!user) return <div className="sh-notification-empty"><Bell size={28} /><strong>Your toolkit updates</strong><p>Sign in to read notifications.</p><Link to="/logIn">Sign in</Link></div>;
  if (feed.loading) return <div className="sh-notification-empty" role="status">Loading notifications...</div>;
  if (feed.error && !feed.items.length) return <div className="sh-notification-empty" role="alert"><p>Could not load notifications.</p><button type="button" onClick={feed.retry}>Try again</button></div>;
  if (!feed.items.length) return <div className="sh-notification-empty" role="status"><Bell size={28} /><strong>No notifications yet</strong><p>Announcements and quiz updates will appear here.</p></div>;
  const items = [...feed.items].filter((item) => !item.dismissed).sort((left, right) => new Date(right.publishedAt || right.updatedAt || 0) - new Date(left.publishedAt || left.updatedAt || 0));
  if (!items.length) return <div className="sh-notification-empty" role="status"><Bell size={28} /><strong>No new notifications</strong><p>You have seen all current updates.</p></div>;
  return <div className="sh-notification-list">{items.map((item) => {
    const date = compactDate(item.publishedAt || item.updatedAt);
    return <article className={`sh-notification-item${item.read ? " is-read" : " is-unread"}`} key={item.id}><div className="sh-notification-row"><Link className="sh-notification-link" to={item.type === "quiz" ? item.target || "/student-dashboard/quiz-updates" : noticeUrl(item.id)} onClick={() => { feed.markRead(item.id); onNavigate?.(); }}><span className="sh-notification-copy">{item.type === "quiz" && <span>Quiz update · Preparation tracker</span>}{item.priority === "important" && <span>Important</span>}<strong>{item.title}</strong><small>{date ? <time dateTime={item.publishedAt || item.updatedAt}>{date}</time> : "Toolkit update"}</small></span>{!item.read && <i className="sh-notification-unread-dot" aria-label="Unread" />}</Link><button type="button" className="sh-notification-dismiss" aria-label={`Dismiss ${item.title}`} title="Dismiss notification" onClick={() => feed.dismiss(item.id)}><X size={16} /></button></div></article>;
  })}</div>;
}
