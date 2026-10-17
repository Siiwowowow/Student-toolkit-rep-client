import test from "node:test";
import assert from "node:assert/strict";
import { dhakaDateInput, quizCountdown, quizReminderCandidates } from "../src/Components/Student/quiz-time.mjs";

test("quiz countdown counts across days and never shows negative time", () => {
  const now = Date.parse("2026-10-17T12:00:00Z");
  assert.equal(quizCountdown("2026-10-18T13:02:03Z", now), "1d 01h 02m 03s");
  assert.equal(quizCountdown("2026-10-17T12:00:00.001Z", now), "00h 00m 01s");
  assert.equal(quizCountdown("2026-10-17T12:00:00Z", now), "Quiz time reached");
  assert.equal(quizCountdown("invalid", now), "Date unavailable");
});
test("reminder window includes its start, excludes expired and disabled quizzes, and changes on reschedule", () => {
  const now = Date.parse("2026-10-17T12:00:00Z");
  const quiz = { id: "q1", quizAt: "2026-10-17T13:00:00Z", reminderEnabled: true, reminderMinutes: 60 };
  assert.equal(quizReminderCandidates([quiz], now - 1).length, 0);
  assert.equal(quizReminderCandidates([quiz], now).length, 1);
  assert.equal(quizReminderCandidates([{ ...quiz, reminderEnabled: false }], now).length, 0);
  assert.equal(quizReminderCandidates([quiz], now + 3600000).length, 0);
  const rescheduled = { ...quiz, quizAt: "2026-10-17T12:30:00Z" };
  assert.notEqual(quizReminderCandidates([quiz], now)[0].reminderKey, quizReminderCandidates([rescheduled], now)[0].reminderKey);
});
test("admin date input always uses Bangladesh time across day boundaries", () => {
  assert.equal(dhakaDateInput("2026-10-17T20:30:00Z"), "2026-10-18T02:30");
  assert.equal(dhakaDateInput(""), "");
});
