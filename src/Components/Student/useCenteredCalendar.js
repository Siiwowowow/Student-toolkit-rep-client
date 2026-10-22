import { useCallback, useState } from 'react';
import { dhakaDateKey } from './study-time.mjs';
import { calendarDateKey, centeredCalendarDates } from './calendar-dates.mjs';

export default function useCenteredCalendar(now) {
  const [selectedKey, setSelectedKey] = useState(null);
  const todayKey = dhakaDateKey(now);
  const selectedDate = new Date(`${selectedKey || todayKey}T12:00:00`);
  const setSelectedDate = useCallback(value => setSelectedKey(previous => {
    const current = new Date(`${previous || todayKey}T12:00:00`);
    const date = typeof value === 'function' ? value(current) : value;
    const key = calendarDateKey(date);
    return key === todayKey ? null : key;
  }), [todayKey]);
  return { selectedDate, setSelectedDate, dates: centeredCalendarDates(selectedDate) };
}
