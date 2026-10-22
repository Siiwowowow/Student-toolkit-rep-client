import test from "node:test";
import assert from "node:assert/strict";
import { createSession, formatMinutes, getMetrics, restoreSession, returnToFocus, transition } from "../src/Components/FocusMode/focus-session.mjs";

test("leaving freezes study time and counts all away time, even with throttled timers", () => {
  let session = createSession("Biology", 25, 1000);
  session = transition(session, "pause", 11000, "Browser minimized");
  assert.deepEqual(getMetrics(session, 71000), { focusedMs: 10000, wastedMs: 60000, remainingMs: 1490000, score: 14 });
  session = transition(session, "resume", 71000);
  assert.equal(getMetrics(session, 81000).focusedMs, 20000);
  assert.equal(getMetrics(session, 81000).wastedMs, 60000);
});

test("blur and visibility events do not duplicate an interruption", () => {
  let session = createSession("Math", 25, 1000);
  session = transition(session, "pause", 2000, "Blur");
  session = transition(session, "pause", 2500, "Hidden");
  assert.equal(session.interruptions.length, 1);
  assert.equal(getMetrics(session, 5000).wastedMs, 3000);
});

test("completion stops at the target, including when leaving after the deadline", () => {
  const session = transition(createSession("Math", 1, 1000), "pause", 81000);
  assert.equal(session.status, "completed");
  assert.equal(session.endedAt, 61000);
  assert.equal(getMetrics(session, 1000000).focusedMs, 60000);
  assert.equal(session.interruptions.length, 0);
});

test("ending while paused freezes wasted time", () => {
  let session = transition(createSession("Math", 25, 1000), "pause", 11000);
  session = transition(session, "finish", 31000);
  assert.equal(getMetrics(session, 90000).wastedMs, 20000);
  assert.equal(getMetrics(session, 90000).focusedMs, 10000);
});

test("reload ends running sessions at the last heartbeat without charging closed time", () => {
  const session = { ...createSession("Physics", 25, 1000), lastSeen: 6000 };
  const restored = restoreSession(JSON.stringify(session));
  assert.equal(restored.status, "ended");
  assert.equal(getMetrics(restored, 66000).focusedMs, 5000);
  assert.equal(getMetrics(restored, 66000).wastedMs, 0);
  assert.equal(restoreSession("invalid"), null);
  assert.equal(restoreSession('{"status":"running"}'), null);
});

test("multiple study chapters survive pause, resume and browser restore", () => {
  const chapters = ["Cell division", "Cell chemistry"];
  let session = createSession("Biology", 25, 1000, chapters);
  chapters.push("Not selected when the session started");
  session = transition(session, "pause", 5000);
  session = transition(session, "resume", 10000);
  const restored = restoreSession(JSON.stringify(session));
  assert.deepEqual(restored.chapters, ["Cell division", "Cell chemistry"]);
  assert.equal(restored.subject, "Biology");
});

test("previously saved sessions still restore without chapter data", () => {
  const session = createSession("Physics", 25, 1000);
  delete session.chapters;
  assert.deepEqual(restoreSession(JSON.stringify(session)).chapters, []);
  assert.equal(restoreSession(JSON.stringify({ ...session, chapters: [null] })), null);
});

test("returning automatically freezes wasted time and restarts study time", () => {
  const paused = transition(createSession("Math", 25, 1000), "pause", 11000, "Browser minimized");
  const resumed = returnToFocus(paused, 136000, true, true);
  assert.equal(resumed.status, "running");
  assert.equal(getMetrics(resumed, 146000).focusedMs, 20000);
  assert.equal(getMetrics(resumed, 146000).wastedMs, 125000);
  assert.equal(formatMinutes(getMetrics(resumed, 146000).wastedMs), "2 min 5 sec");
  assert.equal(returnToFocus(resumed, 147000, true, true), resumed);
  assert.equal(resumed.interruptions.length, 1);
});

test("visibility alone cannot resume an unfocused browser and manual breaks remain paused", () => {
  const paused = transition(createSession("Math", 25, 1000), "pause", 11000, "Switched app");
  assert.equal(returnToFocus(paused, 21000, true, false), paused);
  assert.equal(returnToFocus(paused, 21000, false, true), paused);
  const manual = transition(createSession("Math", 25, 1000), "pause", 11000);
  assert.equal(returnToFocus(manual, 21000, true, true), manual);
});

test("restoring a paused session freezes wasted time at the last heartbeat", () => {
  let session = transition(createSession("Physics", 25, 1000), "pause", 11000, "Browser minimized");
  session = { ...session, lastSeen: 21000 };
  const restored = restoreSession(JSON.stringify(session));
  assert.equal(restored.status, "ended");
  assert.equal(getMetrics(restored, 1000000).wastedMs, 10000);
  assert.equal(returnToFocus(restored, 1000000, true, true), restored);
});
