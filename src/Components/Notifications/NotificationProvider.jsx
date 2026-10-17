import { NotificationContext } from "./notification-context";
import { useAnnouncementFeed } from "./useAnnouncementFeed";

export default function NotificationProvider({ user, role, refreshRole, children }) {
  const feed = useAnnouncementFeed(role === "student" ? user : null, refreshRole);
  const quizzes = useAnnouncementFeed(role === "student" ? user : null, refreshRole, "quiz");
  const dispatch = (action, id) => id.startsWith("quiz:") ? quizzes[action](id.slice(5)) : feed[action](id);
  const combined = {
    items: [...feed.items, ...quizzes.items.map(item => ({ ...item, id: `quiz:${item.id}` }))],
    announcements: feed.items,
    announcementFeed: feed,
    unreadCount: feed.unreadCount + quizzes.unreadCount,
    loading: feed.loading || quizzes.loading,
    error: feed.error || quizzes.error,
    markRead: id => dispatch("markRead", id),
    dismiss: id => dispatch("dismiss", id),
    markAllRead: () => Promise.all([feed.markAllRead(), quizzes.markAllRead()]),
    retry: () => { feed.retry(); quizzes.retry(); },
  };
  return <NotificationContext.Provider value={combined}>{children}</NotificationContext.Provider>;
}
