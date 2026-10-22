import { authenticatedRequest } from "../../api";
import { makeFocusRecord } from "./focus-history.mjs";

export const FOCUS_HISTORY_EVENT = "toolkit-focus-history";
const locks = new Map();
const key = (uid) => `toolkit-focus-history-v1:${uid}`;
const empty = () => ({ records: {}, pending: {} });
function read(uid) {
  const raw = localStorage.getItem(key(uid));
  if (!raw) return empty();
  const value = JSON.parse(raw);
  if (!value?.records || !value?.pending) throw new Error("Focus history storage could not be read.");
  return value;
}
function write(uid, value) {
  localStorage.setItem(key(uid), JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(FOCUS_HISTORY_EVENT, { detail: { uid } }));
}
export function readFocusHistory(uid) {
  return Object.values(read(uid).records);
}
export function pendingFocusHistory(uid) {
  return Object.keys(read(uid).pending).length;
}
export function queueFocusHistory(user, session, now = Date.now()) {
  const record = makeFocusRecord(session, now);
  if (!record) return;
  const data = read(user.uid);
  const previous = data.records[record.id];
  if (previous && ["ended", "completed"].includes(previous.status) && ["running", "paused"].includes(record.status)) return;
  record.recordedAt = Math.max(record.recordedAt, (previous?.recordedAt ?? -1) + 1);
  data.records[record.id] = record;
  data.pending[record.id] = record.recordedAt;
  write(user.uid, data);
}
export function flushFocusHistory(user) {
  if (locks.has(user.uid)) return locks.get(user.uid);
  const work = (async () => {
    while (Object.keys(read(user.uid).pending).length) {
      const ids = Object.keys(read(user.uid).pending);
      for (const id of ids) {
        const record = read(user.uid).records[id];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          await authenticatedRequest(user, `/student/focus-sessions/${encodeURIComponent(id)}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record), signal: controller.signal,
          });
          const current = read(user.uid);
          if (current.pending[id] === record.recordedAt) delete current.pending[id];
          write(user.uid, current);
        } finally { clearTimeout(timeout); }
      }
    }
  })().finally(() => locks.delete(user.uid));
  locks.set(user.uid, work);
  return work;
}
export async function loadFocusHistory(user, from, signal) {
  const records = await authenticatedRequest(user, `/student/focus-sessions?from=${from}`, { signal });
  try {
    const data = read(user.uid);
    for (const record of records) {
      if (!data.records[record.id] || data.records[record.id].recordedAt <= record.recordedAt) data.records[record.id] = record;
    }
    write(user.uid, data);
    return Object.values(data.records);
  } catch {
    // Private-browsing storage restrictions must not hide account history.
    return records;
  }
}
