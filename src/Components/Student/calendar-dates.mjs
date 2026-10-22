import { dhakaDateKey } from './study-time.mjs';

export function calendarDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function centeredCalendarDates(date) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    day.setDate(day.getDate() + index - 3);
    return day;
  });
}

export function quizCalendarDays(items) {
  const groups = {};
  const seen = new Set();
  for (const item of items) {
    if (!item?.id || seen.has(item.id) || !Number.isFinite(Date.parse(item.quizAt))) continue;
    seen.add(item.id);
    const day = dhakaDateKey(Date.parse(item.quizAt));
    (groups[day] ||= []).push(item);
  }
  for (const items of Object.values(groups)) items.sort((a, b) => Date.parse(a.quizAt) - Date.parse(b.quizAt));
  return groups;
}

export function quizCalendarStatus(quiz, now) {
  return Date.parse(quiz.quizAt) <= now ? 'Quiz completed' : 'Quiz';
}
