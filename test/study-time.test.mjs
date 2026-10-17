import test from "node:test";
import assert from "node:assert/strict";
import { dhakaDateKey, dhakaWallDate, formatTime, taskTimestamp, classOccurrence, countdownText, reminderCandidates, taskWindow, taskTimeRange, taskMinutesText } from "../src/Components/Student/study-time.mjs";

const item = { _id: "class", subject: "Physics", day: "Saturday", startTime: "14:54", endTime: "15:55" };
const now = Date.parse("2026-10-17T08:50:00Z");
test("Bangladesh deadlines and weekdays remain identical in different device timezones", () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ["Asia/Dhaka", "UTC", "America/Los_Angeles"]) {
      process.env.TZ = zone;
      assert.equal(taskTimestamp("2026-10-17", "14:54"), Date.parse("2026-10-17T08:54:00Z"));
      assert.equal(dhakaDateKey(Date.parse("2026-10-17T19:00:00Z")), "2026-10-18");
      assert.equal(dhakaWallDate(Date.parse("2026-10-17T19:00:00Z")).getDate(), 18);
      assert.deepEqual(classOccurrence(item, now), { start: Date.parse("2026-10-17T08:54:00Z"), end: Date.parse("2026-10-17T09:55:00Z") });
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
test("12-hour labels cover midnight, noon and afternoon without changing stored times", () => {
  assert.equal(formatTime("00:00"), "12:00 AM");
  assert.equal(formatTime("12:00"), "12:00 PM");
  assert.equal(formatTime("14:54"), "2:54 PM");
  assert.equal(formatTime("23:59"), "11:59 PM");
  assert.equal(formatTime("25:99"), "Time unavailable");
});
test("countdowns advance each second and completed weekly classes move to next week", () => {
  const occurrence = classOccurrence(item, now);
  assert.equal(countdownText(occurrence.start, now), "0h 04m 00s");
  assert.equal(countdownText(occurrence.start, now + 1000), "0h 03m 59s");
  assert.equal(classOccurrence(item, occurrence.start + 1000).end, occurrence.end);
  assert.equal(classOccurrence(item, occurrence.end).start, occurrence.start + 7 * 86400000);
  assert.equal(classOccurrence({ ...item, startTime: "invalid" }, now), null);
});
test("reminders select start/end/deadline stages and exclude completed, overdue and removed records", () => {
  const task = { _id: "task", subject: "Math", deadline: "2026-10-17", timeSlot: "14:54" };
  const upcoming = reminderCandidates([item], [task], now);
  assert.equal(upcoming.length, 2);
  assert.match(upcoming[0].message, /starts in 4 minutes/);
  assert.match(upcoming[1].message, /due in 4 minutes/);
  assert.equal(reminderCandidates([item], [task], now)[0].key, upcoming[0].key);
  const finalMinute = reminderCandidates([item], [task], now + 3 * 60000);
  assert.match(finalMinute[0].message, /starts in 1 minute/);
  assert.notEqual(finalMinute[0].key, upcoming[0].key);
  const ending = reminderCandidates([item], [], Date.parse("2026-10-17T09:50:00Z"));
  assert.match(ending[0].message, /ends in 5 minutes/);
  assert.deepEqual(reminderCandidates([], [{ ...task, completed: true }], now), []);
  assert.deepEqual(reminderCandidates([], [task], now + 10 * 60000), []);
  assert.deepEqual(reminderCandidates([], [], now), []);
});

test("running study sessions count remaining minutes until end, including older tasks", () => {
  const legacy = { deadline: "2026-10-17", timeSlot: "15:23", duration: "60" };
  const current = { deadline: "2026-10-17", startTime: "15:23", endTime: "16:23" };
  assert.deepEqual(taskWindow(legacy), taskWindow(current));
  assert.equal(taskTimeRange(current), "3:23 PM – 4:23 PM");
  assert.equal(taskMinutesText(current, Date.parse("2026-10-17T09:45:00Z")), "38 min left");
  assert.equal(taskMinutesText(current, Date.parse("2026-10-17T09:46:00Z")), "37 min left");
  assert.equal(taskMinutesText(current, Date.parse("2026-10-17T10:23:00Z")), "Time ended");
  assert.match(reminderCandidates([], [{ ...current, _id: "running", subject: "Math" }], Date.parse("2026-10-17T10:15:00Z"))[0].message, /ends in 8 minutes/);
});

test("overnight sessions cross Bangladesh midnight and new sessions remind before starting", () => {
  const task = { _id: "night", subject: "Math", deadline: "2026-10-17", startTime: "23:30", endTime: "00:30" };
  assert.equal(taskWindow(task).duration, 60);
  assert.equal(taskWindow(task).end, Date.parse("2026-10-17T18:30:00Z"));
  assert.equal(taskTimeRange(task), "11:30 PM – 12:30 AM (+1 day)");
  assert.equal(taskMinutesText(task, Date.parse("2026-10-17T18:00:00Z")), "30 min left");
  assert.match(reminderCandidates([], [task], Date.parse("2026-10-17T17:25:00Z"))[0].message, /starts in 5 minutes/);
  assert.equal(taskWindow({ ...task, endTime: "23:30" }), null);
});
