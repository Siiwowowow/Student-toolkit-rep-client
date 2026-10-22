import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDateKey, centeredCalendarDates, quizCalendarDays, quizCalendarStatus } from '../src/Components/Student/calendar-dates.mjs';

test('today is the fourth column even on Sunday, with three past and three future dates', () => {
  const dates = centeredCalendarDates(new Date(2026, 9, 18, 12));
  assert.deepEqual(dates.map(calendarDateKey), ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21']);
  assert.deepEqual(dates.map(date => date.getDay()), [4, 5, 6, 0, 1, 2, 3]);
});
test('centered dates cross month/year and leap-day boundaries correctly', () => {
  assert.deepEqual(centeredCalendarDates(new Date(2027, 0, 1)).map(calendarDateKey), ['2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03', '2027-01-04']);
  assert.equal(calendarDateKey(centeredCalendarDates(new Date(2028, 2, 1))[2]), '2028-02-29');
});
test('quiz dates use Bangladesh time, include multiple quizzes and ignore duplicates/invalid dates', () => {
  const groups = quizCalendarDays([{ id: 'a', quizAt: '2026-10-18T19:00:00Z' }, { id: 'b', quizAt: '2026-10-19T02:00:00+06:00' }, { id: 'a', quizAt: '2026-10-18T19:00:00Z' }, { id: 'bad', quizAt: 'invalid' }]);
  assert.deepEqual(Object.keys(groups), ['2026-10-19']);
  assert.deepEqual(groups['2026-10-19'].map(quiz => quiz.id), ['a', 'b']);
});
test('a rescheduled quiz moves to its new day without leaving a duplicate', () => {
  const item = { id: 'quiz1', quizAt: '2026-10-18T09:00:00+06:00' };
  assert.ok(quizCalendarDays([item])['2026-10-18']);
  const next = quizCalendarDays([{ ...item, quizAt: '2026-10-20T09:00:00+06:00' }]);
  assert.equal(next['2026-10-18'], undefined);
  assert.equal(next['2026-10-20'].length, 1);
  assert.deepEqual(quizCalendarDays([]), {});
});
test('quiz completion reflects scheduled time without modifying study progress', () => {
  const quiz = { quizAt: '2026-10-18T09:00:00+06:00', progress: { percentage: 20 } };
  const at = Date.parse(quiz.quizAt);
  assert.equal(quizCalendarStatus(quiz, at - 1), 'Quiz');
  assert.equal(quizCalendarStatus(quiz, at), 'Quiz completed');
  assert.equal(quizCalendarStatus(quiz, at + 86400000), 'Quiz completed');
  assert.equal(quiz.progress.percentage, 20);
});
