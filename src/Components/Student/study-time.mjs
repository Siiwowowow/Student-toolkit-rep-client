export const DHAKA_ZONE = "Asia/Dhaka";
const DAY = 86400000;
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: DHAKA_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
export const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function dhakaDateKey(now = Date.now()) {
  const parts = dateFormatter.formatToParts(now);
  const get = type => parts.find(part => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function dhakaWallDate(now = Date.now()) {
  // Calendar widgets use local date getters; construct the Bangladesh calendar day explicitly.
  return new Date(`${dhakaDateKey(now)}T12:00:00`);
}
export function formatTime(time) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) return "Time unavailable";
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}
export function taskTimestamp(deadline, timeSlot) {
  const date = String(deadline || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(timeSlot || "")) return NaN;
  return Date.parse(`${date}T${timeSlot}:00+06:00`);
}
export function classOccurrence(item, now = Date.now()) {
  const targetDay = WEEK_DAYS.indexOf(item.day);
  const midnight = Date.parse(`${dhakaDateKey(now)}T00:00:00Z`);
  if (targetDay < 0) return null;
  const offset = (targetDay - new Date(midnight).getUTCDay() + 7) % 7;
  const date = new Date(midnight + offset * DAY).toISOString().slice(0, 10);
  let start = taskTimestamp(date, item.startTime), end = taskTimestamp(date, item.endTime);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (end <= start) end += DAY;
  if (end <= now) { start += 7 * DAY; end += 7 * DAY; }
  return { start, end };
}
export function countdownText(target, now = Date.now()) {
  if (!Number.isFinite(target)) return "Time unavailable";
  const seconds = Math.max(0, Math.ceil((target - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds % 60).padStart(2, "0")}s`;
}
export function taskWindow(task) {
  const startTime = task.startTime || task.timeSlot;
  const start = taskTimestamp(task.deadline, startTime);
  if (!Number.isFinite(start)) return null;
  let end;
  if (task.endTime) {
    end = taskTimestamp(task.deadline, task.endTime);
    if (!Number.isFinite(end) || end === start) return null;
    if (end < start) end += DAY;
  } else {
    const minutes = Number(task.duration);
    end = start + (Number.isFinite(minutes) && minutes > 0 ? minutes * 60000 : 0);
  }
  return { start, end, startTime, endTime: new Date(end + 6 * 3600000).toISOString().slice(11, 16), duration: Math.round((end - start) / 60000), hasDuration: end > start };
}
export function taskTimeRange(task) {
  const window = taskWindow(task);
  if (!window) return "Time unavailable";
  const overnight = dhakaDateKey(window.start) !== dhakaDateKey(window.end);
  return `${formatTime(window.startTime)} – ${formatTime(window.endTime)}${overnight ? " (+1 day)" : ""}`;
}
export function taskMinutesText(task, now = Date.now()) {
  const window = taskWindow(task);
  if (!window) return "Time unavailable";
  if (task.completed) return `${window.duration} min completed`;
  if (now < window.start) return `${window.duration} min planned`;
  if (now < window.end) return `${Math.ceil((window.end - now) / 60000)} min left`;
  return "Time ended";
}
export function reminderCandidates(classes, tasks, now = Date.now()) {
  const candidates = [];
  const add = (item, kind, phase, target) => {
    const minutes = (target - now) / 60000;
    if (!item._id || !(minutes > 0 && minutes <= 10)) return;
    const bucket = minutes <= 1 ? 1 : 10;
    candidates.push({ key: `${kind}:${item._id}:${target}:${phase}:${bucket}`, message: `${item.subject}: ${phase} in ${Math.ceil(minutes)} minute${Math.ceil(minutes) === 1 ? "" : "s"} (Bangladesh time).` });
  };
  for (const item of classes) {
    const occurrence = classOccurrence(item, now);
    if (occurrence) add(item, "class", now < occurrence.start ? "starts" : "ends", now < occurrence.start ? occurrence.start : occurrence.end);
  }
  for (const item of tasks) if (!item.completed) {
    const window = taskWindow(item);
    if (window) add(item, "task", now < window.start ? window.hasDuration ? "starts" : "due" : "ends", now < window.start ? window.start : window.end);
  }
  return candidates;
}
