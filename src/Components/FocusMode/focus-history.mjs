import { getMetrics, transition } from "./focus-session.mjs";

const DAY = 86400000;
const OFFSET = 6 * 3600000;
export const focusDate = (time) => new Date(time + OFFSET).toISOString().slice(0, 10);

export function makeFocusRecord(session, now = Date.now()) {
  if (!session) return null;
  const settled = session.status === "running" && now - session.lastSeen > 5000
    ? transition(session, "pause", session.lastSeen, "Device slept or browser was suspended")
    : transition(session, "tick", now);
  return { ...settled, id: settled.id || `legacy-${settled.startedAt}`, recordedAt: now };
}

export function focusSegments(record) {
  const end = record.endedAt ?? record.recordedAt;
  let cursor = record.startedAt;
  let remaining = getMetrics(record, record.recordedAt).focusedMs;
  const segments = [];
  const focused = (until) => {
    const duration = Math.min(remaining, Math.max(0, until - cursor));
    if (duration) segments.push({ start: cursor, end: cursor + duration, kind: "focusedMs" });
    remaining -= duration;
  };
  for (const interruption of record.interruptions) {
    focused(Math.min(end, interruption.startedAt));
    const pauseEnd = Math.min(end, interruption.endedAt ?? end);
    if (pauseEnd > interruption.startedAt) segments.push({ start: interruption.startedAt, end: pauseEnd, kind: "wastedMs" });
    cursor = pauseEnd;
  }
  focused(end);
  return segments;
}

export function summarizeFocusWeek(records, now = Date.now()) {
  const midnight = Date.parse(`${focusDate(now)}T00:00:00+06:00`);
  const weekday = new Date(midnight + OFFSET).getUTCDay();
  const start = midnight - ((weekday + 6) % 7) * DAY;
  const end = start + 7 * DAY;
  const days = Array.from({ length: 7 }, (_, index) => ({
    date: focusDate(start + index * DAY), focusedMs: 0, wastedMs: 0,
  }));
  const summary = { start, end, days, focusedMs: 0, wastedMs: 0, goalMs: 0, sessions: 0, completed: 0, interruptions: 0, score: 0, progress: 0, recent: [] };
  const unique = new Map();
  for (const record of records) {
    if (!record?.id || !Number.isFinite(record.recordedAt)) continue;
    if (!unique.has(record.id) || unique.get(record.id).recordedAt < record.recordedAt) unique.set(record.id, record);
  }
  for (const record of unique.values()) {
    const segments = focusSegments(record);
    let focusedBefore = 0, focusedThisWeek = 0, wastedThisWeek = 0;
    for (const segment of segments) {
      if (segment.kind === "focusedMs") focusedBefore += Math.max(0, Math.min(segment.end, start) - segment.start);
      for (let index = 0; index < 7; index++) {
        const duration = Math.max(0, Math.min(segment.end, start + (index + 1) * DAY) - Math.max(segment.start, start + index * DAY));
        days[index][segment.kind] += duration;
        if (segment.kind === "focusedMs") focusedThisWeek += duration;
        else wastedThisWeek += duration;
      }
    }
    if (focusedThisWeek || wastedThisWeek || record.startedAt >= start && record.startedAt < end) {
      summary.sessions++;
      summary.goalMs += Math.max(0, record.goalMs - focusedBefore);
      summary.focusedMs += focusedThisWeek;
      summary.wastedMs += wastedThisWeek;
      summary.interruptions += record.interruptions.filter((entry) => entry.startedAt >= start && entry.startedAt < end).length;
      if (record.status === "completed" && record.endedAt >= start && record.endedAt < end) summary.completed++;
      summary.recent.push({ ...record, weeklyFocusedMs: focusedThisWeek, weeklyWastedMs: wastedThisWeek });
    }
  }
  const total = summary.focusedMs + summary.wastedMs;
  summary.score = total ? Math.round(summary.focusedMs / total * 100) : 0;
  summary.progress = summary.goalMs ? Math.min(100, Math.round(summary.focusedMs / summary.goalMs * 100)) : 0;
  summary.recent.sort((left, right) => right.recordedAt - left.recordedAt);
  return summary;
}
