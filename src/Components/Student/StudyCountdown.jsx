import useStudyClock from "./useStudyClock";
import { classOccurrence, countdownText, taskTimestamp, taskWindow } from "./study-time.mjs";
import "./StudyTime.css";

export default function StudyCountdown({ classItem, task, dateKey }) {
  const now = useStudyClock();
  if (task?.completed) return <span className="study-countdown is-complete">Completed</span>;
  const occurrence = classItem ? dateKey ? { start: taskTimestamp(dateKey, classItem.startTime), end: taskTimestamp(dateKey, classItem.endTime) } : classOccurrence(classItem, now) : taskWindow(task || {});
  if (!occurrence) return null;
  if (classItem && occurrence.end <= now) return <span className="study-countdown is-complete">Finished</span>;
  const ongoing = now >= occurrence.start && now < occurrence.end;
  const target = ongoing ? occurrence.end : occurrence.start;
  if (!Number.isFinite(target)) return null;
  const overdue = !classItem && occurrence.end <= now;
  return <span className={`study-countdown${overdue ? " is-overdue" : ongoing ? " is-running" : ""}`} title="Bangladesh time (UTC+6)">
    {overdue ? "Overdue" : `${ongoing ? "Ends" : classItem || occurrence.hasDuration ? "Starts" : "Due"} in ${countdownText(target, now)}`}
  </span>;
}
