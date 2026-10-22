export const isActive = (session) => session && ["running", "paused"].includes(session.status);

export function createSession(subject, minutes, now, chapters = []) {
  return {
    id: crypto.randomUUID(),
    subject: subject.trim(), chapters: [...chapters], goalMs: minutes * 60000, startedAt: now,
    status: "running", focusedMs: 0, runningSince: now, lastSeen: now,
    interruptions: [], endedAt: null,
  };
}

export function getMetrics(session, now) {
  if (!session) return { focusedMs: 0, wastedMs: 0, remainingMs: 0, score: 0 };
  const focusedMs = Math.min(session.goalMs, session.focusedMs +
    (session.status === "running" ? Math.max(0, now - session.runningSince) : 0));
  const wastedMs = session.interruptions.reduce((total, entry) =>
    total + Math.max(0, (entry.endedAt ?? now) - entry.startedAt), 0);
  const total = focusedMs + wastedMs;
  return { focusedMs, wastedMs, remainingMs: session.goalMs - focusedMs,
    score: total ? Math.round(focusedMs / total * 100) : 0 };
}

export function transition(session, action, now, reason = "Manual pause") {
  if (!isActive(session)) return session;
  const metrics = getMetrics(session, now);
  if (metrics.remainingMs <= 0 && session.status === "running") {
    return { ...session, status: "completed", focusedMs: session.goalMs,
      runningSince: null, endedAt: session.runningSince + session.goalMs - session.focusedMs };
  }
  if (action === "pause" && session.status === "running") {
    return { ...session, status: "paused", focusedMs: metrics.focusedMs,
      runningSince: null, lastSeen: now,
      interruptions: [...session.interruptions, { startedAt: now, endedAt: null, reason }] };
  }
  if (action === "resume" && session.status === "paused") {
    return { ...session, status: "running", runningSince: now, lastSeen: now,
      interruptions: session.interruptions.map((entry) => entry.endedAt === null ? { ...entry, endedAt: now } : entry) };
  }
  if (action === "finish") {
    return { ...session, status: "ended", focusedMs: metrics.focusedMs, runningSince: null, endedAt: now,
      interruptions: session.interruptions.map((entry) => entry.endedAt === null ? { ...entry, endedAt: now } : entry) };
  }
  return session;
}

export function restoreSession(raw) {
  try {
    const session = JSON.parse(raw);
    if (!session || typeof session.subject !== "string" ||
      !["running", "paused", "completed", "ended"].includes(session.status) ||
      !Number.isFinite(session.goalMs) || session.goalMs <= 0 ||
      !Number.isFinite(session.focusedMs) || session.focusedMs < 0 ||
      !Number.isFinite(session.startedAt) || !Number.isFinite(session.lastSeen) ||
      (session.status === "running" && !Number.isFinite(session.runningSince)) ||
      (session.chapters !== undefined && (!Array.isArray(session.chapters) ||
        !session.chapters.every((chapter) => typeof chapter === "string" && chapter.trim()))) ||
      !Array.isArray(session.interruptions) || !session.interruptions.every((entry) =>
        Number.isFinite(entry.startedAt) && (entry.endedAt === null || Number.isFinite(entry.endedAt)) && typeof entry.reason === "string")) return null;
    session.chapters ??= [];
    // A new document must never charge time while the website was closed.
    // pagehide normally ends it; lastSeen is the fallback after a crash/mobile kill.
    return isActive(session) ? transition(session, "finish", session.lastSeen) : session;
  } catch { return null; }
}

export function returnToFocus(session, now, visible, focused) {
  if (!visible || !focused || session?.status !== "paused") return session;
  const interruption = session.interruptions.at(-1);
  // An intentional break still uses the Resume button.
  if (!interruption || interruption.reason === "Manual pause") return session;
  return transition(session, "resume", now);
}

export function formatMinutes(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
}

export function formatDuration(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
}
