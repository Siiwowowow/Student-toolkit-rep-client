import test from "node:test";
import assert from "node:assert/strict";
import { createSession, transition } from "../src/Components/FocusMode/focus-session.mjs";
import { focusSegments, makeFocusRecord, summarizeFocusWeek } from "../src/Components/FocusMode/focus-history.mjs";

const at = (date) => Date.parse(date);

test("reset archives focused and paused time; a new session has a separate identity", () => {
  const start = at("2026-10-19T10:00:00+06:00");
  let session = createSession("Physics", 25, start, ["Vectors"]);
  session = transition(session, "pause", start + 10 * 60000);
  const archived = makeFocusRecord(transition(session, "finish", start + 15 * 60000), start + 15 * 60000);
  const next = createSession("Biology", 25, start + 16 * 60000);
  assert.notEqual(next.id, archived.id);
  assert.equal(next.focusedMs, 0);
  assert.deepEqual(next.interruptions, []);
  const week = summarizeFocusWeek([archived], start);
  assert.equal(week.focusedMs, 10 * 60000);
  assert.equal(week.wastedMs, 5 * 60000);
  assert.equal(week.score, 67);
  assert.equal(week.progress, 40);
  assert.equal(week.sessions, 1);
  assert.equal(week.completed, 0);
});

test("duplicate snapshots count once and focus score is weighted by time", () => {
  const start = at("2026-10-19T10:00:00+06:00");
  const first = createSession("Physics", 25, start);
  const partial = makeFocusRecord(transition(first, "pause", start + 60000), start + 60000);
  let second = transition(first, "pause", start + 10 * 60000);
  second = transition(second, "finish", start + 15 * 60000);
  const complete = makeFocusRecord(second, start + 15 * 60000);
  const short = createSession("Math", 1, start + 20 * 60000);
  const goal = makeFocusRecord(transition(short, "tick", short.startedAt + 60000), short.startedAt + 60000);
  const week = summarizeFocusWeek([partial, complete, partial, goal], start);
  assert.equal(week.sessions, 2);
  assert.equal(week.focusedMs, 11 * 60000);
  assert.equal(week.wastedMs, 5 * 60000);
  assert.equal(week.score, 69);
  assert.equal(week.completed, 1);
});

test("study and pauses are split at Bangladesh midnight and Monday week boundary", () => {
  const start = at("2026-10-18T23:50:00+06:00");
  let session = createSession("Physics", 60, start);
  session = transition(session, "pause", start + 20 * 60000);
  session = transition(session, "resume", start + 30 * 60000);
  session = transition(session, "finish", start + 40 * 60000);
  const record = makeFocusRecord(session, start + 40 * 60000);
  const sunday = summarizeFocusWeek([record], start);
  const monday = summarizeFocusWeek([record], start + 40 * 60000);
  assert.equal(sunday.days[6].focusedMs, 10 * 60000);
  assert.equal(sunday.focusedMs, 10 * 60000);
  assert.equal(monday.days[0].focusedMs, 20 * 60000);
  assert.equal(monday.days[0].wastedMs, 10 * 60000);
  assert.equal(monday.goalMs, 50 * 60000);
  assert.equal(monday.progress, 40);
  assert.equal(monday.interruptions, 1);
});

test("completed records stay frozen and snapshots do not count device-sleep gaps as focus", () => {
  const start = at("2026-10-19T10:00:00+06:00");
  const session = { ...createSession("Math", 25, start), lastSeen: start + 4000 };
  const saved = makeFocusRecord(session, start + 60000);
  assert.equal(saved.status, "paused");
  const week = summarizeFocusWeek([saved], start);
  assert.equal(week.focusedMs, 4000);
  assert.equal(week.wastedMs, 56000);
  const completed = transition(createSession("Math", 1, start), "tick", start + 60000);
  const historical = makeFocusRecord(completed, start + 20 * 86400000);
  assert.equal(focusSegments(historical).reduce((sum, segment) => sum + segment.end - segment.start, 0), 60000);
  assert.equal(summarizeFocusWeek([historical], start + 20 * 86400000).sessions, 0);
});

test("legacy sessions retain a stable identity across reset, refresh and import", () => {
  const session = createSession("Math", 1, at("2026-10-19T10:00:00+06:00"));
  delete session.id;
  const first = makeFocusRecord(session, session.startedAt + 1000);
  const last = makeFocusRecord(transition(session, "finish", session.startedAt + 2000), session.startedAt + 2000);
  assert.equal(first.id, last.id);
  assert.equal(summarizeFocusWeek([first, last], session.startedAt).sessions, 1);
});
