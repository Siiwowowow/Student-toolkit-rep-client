import { Link } from 'react-router';
import { quizCalendarStatus } from './calendar-dates.mjs';
import './CalendarQuizzes.css';

export function QuizDateBadge({ quizzes = [], now }) {
  if (!quizzes.length) return null;
  const upcoming = quizzes.some(quiz => Date.parse(quiz.quizAt) > now);
  return <span className={`calendar-quiz-date-badge${upcoming ? '' : ' is-completed'}`} title={quizzes.map(quiz => `${quiz.title}: ${quizCalendarStatus(quiz, now)}`).join('\n')}>{upcoming ? 'Quiz' : 'Quiz completed'}{quizzes.length > 1 ? ` (${quizzes.length})` : ''}</span>;
}

export function CalendarQuizzes({ quizzes = [], now }) {
  if (!quizzes.length) return null;
  return <div className="calendar-quiz-links" aria-label="Quizzes on this date">{quizzes.map(quiz => <Link key={quiz.id} to={`/quiz-tracker#quiz-${encodeURIComponent(quiz.id)}`} className={Date.parse(quiz.quizAt) <= now ? 'is-completed' : ''} title={`${quiz.title} · ${new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit' }).format(new Date(quiz.quizAt))} · ${quizCalendarStatus(quiz, now)}`}><span>{quizCalendarStatus(quiz, now)}</span><strong>{quiz.title}</strong></Link>)}</div>;
}

export function CalendarQuizNotice({ state }) {
  if (state.error) return <p className="calendar-quiz-notice" role="alert">Quiz dates could not refresh. <button type="button" onClick={state.reload}>Retry quiz dates</button></p>;
  return <p className="calendar-quiz-notice" role="status">{state.loading ? 'Loading quiz dates…' : 'Published quiz dates sync automatically. Open a quiz label to view its tracker.'}</p>;
}
