export const DEFAULT_COLLEGE = "Notre Dame College";
export function quizCountdown(quizAt, now) {
  const remaining = new Date(quizAt).getTime() - now;
  if (!Number.isFinite(remaining)) return "Date unavailable";
  if (remaining <= 0) return "Quiz time reached";
  const seconds = Math.ceil(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  return `${days ? `${days}d ` : ""}${String(Math.floor(seconds / 3600) % 24).padStart(2, "0")}h ${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}m ${String(seconds % 60).padStart(2, "0")}s`;
}
export const quizDateLabel = value => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
export function quizReminderCandidates(items, now) {
  return items.filter(item => {
    const remaining = new Date(item.quizAt).getTime() - now;
    return item.reminderEnabled && remaining > 0 && remaining <= item.reminderMinutes * 60000;
  }).map(item => ({ ...item, reminderKey: `quiz:${item.id}:${item.quizAt}:${item.reminderMinutes}` }));
}
export function dhakaDateInput(value) {
  if (!value) return "";
  return new Date(new Date(value).getTime() + 6 * 3600000).toISOString().slice(0, 16);
}
