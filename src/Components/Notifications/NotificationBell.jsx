import { useContext, useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import { NotificationContext } from "./notification-context";
import NotificationInbox from "./NotificationInbox";

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const feed = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null), button = useRef(null);
  useEffect(() => {
    const outside = event => { if (!ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <div className="sh-notifications std-notifications" ref={ref} onKeyDown={event => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } }}>
    <button type="button" className="std-icon-button std-notice-indicator" ref={button} aria-label={`Notifications, ${feed.unreadCount} unread`} aria-expanded={open} aria-controls="std-notification-panel" onClick={() => setOpen(value => !value)}><Bell size={18} />{feed.unreadCount > 0 && <span>{feed.unreadCount > 99 ? "99+" : feed.unreadCount}</span>}</button>
    {open && <section className="sh-notification-panel" id="std-notification-panel" aria-label="Notifications"><div className="sh-notification-heading"><strong>Notifications</strong><div className="sh-notification-heading-actions"><button type="button" disabled={!feed.unreadCount} className="sh-notification-mark-all" onClick={feed.markAllRead}>Mark all read</button><button type="button" className="std-icon-button" aria-label="Close notifications" onClick={() => { setOpen(false); button.current?.focus(); }}><X size={17} /></button></div></div><NotificationInbox user={user} feed={feed} onNavigate={() => setOpen(false)} /></section>}
  </div>;
}
