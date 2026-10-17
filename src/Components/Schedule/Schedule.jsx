import useCurriculum from "../Student/useCurriculum";
import SubjectTopicFields from "../Student/SubjectTopicFields";
import { dhakaWallDate, dhakaDateKey, formatTime } from "../Student/study-time.mjs";
import useStudyClock from "../Student/useStudyClock";
import StudyCountdown from "../Student/StudyCountdown";
import { notifyStudyChanged } from "../Student/study-events";
import { isCancel } from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Atom,
  BookOpen,
  Brain,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock3,
  Code2,
  Dna,
  FlaskConical,
  GraduationCap,
  Languages,
  Landmark,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import { API_BASE, apiClient as axios } from "../../api";
import "./Schedule.css";

const classesUrl = `${API_BASE}/classes`;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const calendarHourHeight = 78;
const calendarMinuteHeight = calendarHourHeight / 60;
const calendarDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const subjectIcons = {
  Mathematics: ChartNoAxesColumnIncreasing,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  "Computer Science": Code2,
  English: Languages,
  History: Landmark,
  Economics: ChartNoAxesColumnIncreasing,
  Psychology: Brain,
  Philosophy: BookOpen,
};
const subjectAccents = {
  Mathematics: "#3678f5",
  Physics: "#ec3e83",
  Chemistry: "#ffb620",
  Biology: "#19b981",
  "Computer Science": "#8b5cf6",
  English: "#a24df4",
  History: "#f27625",
  Economics: "#00a7a7",
  Psychology: "#e64eaf",
  Philosophy: "#657080",
};
const initialForm = {
  subject: "",
  topic: "",
  instructor: "",
  day: "Monday",
  startTime: "",
  endTime: "",
};
const minutesOfDay = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const formatHour = (hour) => `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
const getWeekStart = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  return start;
};

export default function Schedule() {
  const now = useStudyClock();
  const curriculum = useCurriculum();
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("week");
  const [activeDay, setActiveDay] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [selectedDate, setSelectedDate] = useState(() => dhakaWallDate());
  const [calendarMonth, setCalendarMonth] = useState(() => dhakaWallDate());
  const calendarStartHour = Math.min(7, ...classes.map(item => Math.floor(minutesOfDay(item.startTime) / 60)).filter(Number.isFinite));
  const calendarEndHour = Math.max(22, ...classes.map(item => Math.ceil(minutesOfDay(item.endTime) / 60)).filter(Number.isFinite));
  const calendarHours = Array.from({ length: calendarEndHour - calendarStartHour }, (_, index) => index + calendarStartHour);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const fetchClasses = async () => {
      if (!user?.email) {
        setClasses([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(classesUrl, {
          params: { email: user.email },
          signal: controller.signal,
        });
        if (!response.data?.success || !Array.isArray(response.data.data)) {
          throw new Error("The schedule response was not in the expected format.");
        }
        if (isActive) setClasses(response.data.data);
      } catch (error) {
        if (!isActive || isCancel(error)) return;
        console.error("Unable to load schedule:", error);
        toast.error(error.response?.data?.error || "Could not load your classes. Please try again.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchClasses();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [user?.email]);

  const filteredClasses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return classes.filter((classItem) => {
      const matchesDay = activeDay === "All" || classItem.day === activeDay;
      const matchesSearch =
        !query ||
        [classItem.subject, classItem.instructor, classItem.topic]
          .some((value) => value?.toLowerCase().includes(query));
      return matchesDay && matchesSearch;
    });
  }, [activeDay, classes, searchTerm]);

  const sortedClasses = useMemo(
    () => [...filteredClasses].sort((first, second) => {
      const dayDifference = days.indexOf(first.day) - days.indexOf(second.day);
      return dayDifference || minutesOfDay(first.startTime) - minutesOfDay(second.startTime);
    }),
    [filteredClasses],
  );

  const totalHours = classes.reduce(
    (total, classItem) => total + (minutesOfDay(classItem.endTime) - minutesOfDay(classItem.startTime)) / 60,
    0,
  );
  const today = dhakaWallDate(now);
  const todayName = days[(today.getDay() + 6) % 7];
  const todayClasses = classes
    .filter((classItem) => classItem.day === todayName)
    .sort((first, second) => minutesOfDay(first.startTime) - minutesOfDay(second.startTime));
  const dhakaClock = new Date(now + 6 * 60 * 60 * 1000);
  const nowMinutes = dhakaClock.getUTCHours() * 60 + dhakaClock.getUTCMinutes();
  const nextClass = todayClasses.find((classItem) => minutesOfDay(classItem.endTime) > nowMinutes);
  const subjectCounts = Object.entries(
    classes.reduce((counts, classItem) => {
      counts[classItem.subject] = (counts[classItem.subject] || 0) + 1;
      return counts;
    }, {}),
  ).sort((first, second) => second[1] - first[1]);
  const weekStart = getWeekStart(selectedDate);
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const monthGridStart = getWeekStart(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(monthGridStart);
    date.setDate(monthGridStart.getDate() + index);
    return date;
  });
  const isCurrentWeek = calendarDateKey(weekStart) === calendarDateKey(getWeekStart(today));
  const goToToday = () => {
    const date = dhakaWallDate(now);
    setSelectedDate(date); setCalendarMonth(date); setActiveDay(todayName);
  };
  const weekDates = days.map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const dateRange = `${weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + 6,
  ).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`;

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ ...initialForm, day: activeDay === "All" ? todayName : activeDay });
    setShowModal(true);
  };

  const openEditModal = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      subject: classItem.subject || "",
      topic: classItem.topic || "",
      instructor: classItem.instructor || "",
      day: classItem.day || "Monday",
      startTime: classItem.startTime || "",
      endTime: classItem.endTime || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingClass(null);
    setFormData(initialForm);
  };

  const handleSaveClass = async (event) => {
    event.preventDefault();
    if (!user?.email) {
      toast.error("Please sign in again to save your schedule.");
      return;
    }
    if (
      !formData.subject || !formData.topic ||
      !formData.instructor.trim() ||
      !formData.startTime ||
      !formData.endTime ||
      !days.includes(formData.day)
    ) {
      toast.error("Please complete all required class details.");
      return;
    }
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be later than start time.");
      return;
    }

    const classData = {
      subject: formData.subject,
      topic: formData.topic,
      instructor: formData.instructor.trim(),
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      email: user.email,
    };

    setSaving(true);
    try {
      if (editingClass) {
        const response = await axios.put(`${classesUrl}/${editingClass._id}`, classData);
        if (!response.data?.success) throw new Error(response.data?.error || "Could not update class.");
        setClasses((current) =>
          current.map((classItem) =>
            classItem._id === editingClass._id ? { ...classItem, ...classData } : classItem,
          ),
        );
        toast.success("Class updated.");
      } else {
        const response = await axios.post(classesUrl, classData);
        if (!response.data?.success || !response.data.data?._id) {
          throw new Error(response.data?.error || "The server did not confirm the new class.");
        }
        setClasses((current) => [...current, response.data.data]);
        toast.success("Class added to your week.");
      }
      setShowModal(false);
      notifyStudyChanged();
      setEditingClass(null);
      setFormData(initialForm);
    } catch (error) {
      console.error("Unable to save class:", error);
      toast.error(error.response?.data?.error || error.message || "Could not save this class. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!confirmDelete || !user?.email) return;
    setDeleting(true);
    try {
      const response = await axios.delete(`${classesUrl}/${confirmDelete._id}`, {
        params: { email: user.email },
      });
      if (!response.data?.success) throw new Error(response.data?.error || "Could not delete class.");
      setClasses((current) => current.filter((classItem) => classItem._id !== confirmDelete._id));
      toast.success("Class removed from your week.");
      setConfirmDelete(null);
      notifyStudyChanged();
    } catch (error) {
      console.error("Unable to delete class:", error);
      toast.error(error.response?.data?.error || error.message || "Could not delete this class. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const renderClassCard = (classItem, index) => {
    const SubjectIcon = subjectIcons[classItem.subject] || BookOpen;
    return (
      <article
        className="schedule-class-card"
        key={classItem._id}
        style={{ "--subject-accent": subjectAccents[classItem.subject] || "#e7fa37", "--card-index": index }}
      >
        <div className="schedule-class-icon"><SubjectIcon size={20} /></div>
        <div className="schedule-class-main">
          <div className="schedule-class-title-row">
            <h3>{classItem.subject}</h3>{classItem.topic && <p className="schedule-class-topic" title={classItem.topic}>{classItem.topic}</p>}
            <span className="schedule-class-day">{classItem.day}</span>
          </div>
          <div className="schedule-class-details">
            <span><Clock3 size={14} /> {formatTime(classItem.startTime)} – {formatTime(classItem.endTime)}</span>
            <span><UsersRound size={14} /> {classItem.instructor}</span>
          </div>
          <StudyCountdown classItem={classItem} dateKey={weekDates[days.indexOf(classItem.day)] ? calendarDateKey(weekDates[days.indexOf(classItem.day)]) : undefined} />
        </div>
        <div className="schedule-card-actions">
          <button
            className="schedule-icon-button"
            onClick={() => openEditModal(classItem)}
            title={`Edit ${classItem.subject}`}
            aria-label={`Edit ${classItem.subject}`}
          >
            <Pencil size={16} />
          </button>
          <button
            className="schedule-icon-button is-delete"
            onClick={() => setConfirmDelete(classItem)}
            title={`Delete ${classItem.subject}`}
            aria-label={`Delete ${classItem.subject}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className="schedule-page">
      <div className="schedule-shell">
        <header className="schedule-page-heading">
          <div>
            <span className="schedule-kicker"><CalendarDays size={15} /> YOUR PERSONAL CLASS PLANNER</span>
            <h1>Your Study <span>Schedule</span></h1>
            <p>Stay organized, manage your classes, and make every hour count.</p>
            <p className="study-time-note">Bangladesh time (UTC+6) · 12-hour AM/PM · Reminders 10 minutes and 1 minute before.</p>
          </div>
          <button className="schedule-add-button" onClick={openAddModal}>
            <Plus size={18} /> Add class
          </button>
        </header>

        <section className="schedule-stats" aria-label="Schedule summary">
          <article className="schedule-stat-card schedule-stat-blue">
            <div className="schedule-stat-icon"><CalendarDays size={20} /></div>
            <span className="schedule-stat-label">CLASSES TODAY</span>
            <strong>{todayClasses.length}</strong>
            <span className="schedule-stat-caption">{todayName}</span>
          </article>
          <article className="schedule-stat-card schedule-stat-lime">
            <div className="schedule-stat-icon"><BookOpen size={20} /></div>
            <span className="schedule-stat-label">WEEKLY CLASSES</span>
            <strong>{classes.length}</strong>
            <span className="schedule-stat-caption">across your timetable</span>
          </article>
          <article className="schedule-stat-card schedule-stat-violet">
            <div className="schedule-stat-icon"><Clock3 size={20} /></div>
            <span className="schedule-stat-label">STUDY TIME</span>
            <strong>{totalHours.toFixed(1)}<small>h</small></strong>
            <span className="schedule-stat-caption">scheduled this week</span>
          </article>
          <article className="schedule-stat-card schedule-stat-peach">
            <div className="schedule-stat-icon"><GraduationCap size={20} /></div>
            <span className="schedule-stat-label">WEEKLY GOAL</span>
            <strong>{Math.min(Math.round((totalHours / 25) * 100), 100)}<small>%</small></strong>
            <span className="schedule-stat-caption">of 25 study hours</span>
          </article>
        </section>

        <div className="schedule-dashboard-grid">
          <section className="schedule-calendar-panel">
            <div className="schedule-calendar-toolbar">
              <div>
                <span className="schedule-eyebrow">YOUR TIMETABLE</span>
                <h2>{isCurrentWeek ? "This week" : "Selected week"}</h2>
              </div>
              <div className="schedule-calendar-tools">
                <span className="schedule-date-range">{dateRange}</span>
                <button className="schedule-today-button" onClick={goToToday}>Today</button>
                <div className="schedule-view-switch" aria-label="Calendar view">
                  <button className={view === "week" ? "is-active" : ""} onClick={() => setView("week")}>Week</button>
                  <button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}>List</button>
                </div>
              </div>
            </div>

            <div className="schedule-filter-row">
              <label className="schedule-search">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search"><X size={16} /></button>
                )}
              </label>
              <div className="schedule-day-filters" aria-label="Filter by day">
                <button className={activeDay === "All" ? "is-active" : ""} onClick={() => setActiveDay("All")}>All</button>
                {days.map((day) => (
                  <button
                    className={activeDay === day ? "is-active" : ""}
                    key={day}
                    onClick={() => setActiveDay(day)}
                    aria-label={`Filter ${day}`}
                  >
                    {day.slice(0, 1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="schedule-state" role="status"><span className="schedule-spinner" /> Loading your classes…</div>
            ) : view === "week" ? (
              <div className="schedule-calendar-scroll">
                <div className="schedule-week-calendar" style={{ "--calendar-hour-height": `${calendarHourHeight}px`, "--calendar-lane-height": `${calendarHours.length * calendarHourHeight}px` }}>
                  <div className="schedule-time-rail">
                    <div className="schedule-calendar-day-heading schedule-time-heading">TIME</div>
                    {calendarHours.map((hour) => <div className="schedule-time-label" key={hour}>{formatHour(hour)}</div>)}
                  </div>
                  {days.map((day, dayIndex) => {
                    const date = weekDates[dayIndex];
                    const dateNumber = date.getDate();
                    const dayClasses = filteredClasses
                      .filter((classItem) => classItem.day === day)
                      .sort((first, second) => minutesOfDay(first.startTime) - minutesOfDay(second.startTime));
                    const isToday = calendarDateKey(date) === dhakaDateKey(now);
                    return (
                      <div className={`schedule-calendar-day ${isToday ? "is-today" : ""}`} key={day}>
                        <button
                          className="schedule-calendar-day-heading"
                          onClick={() => setActiveDay(day)}
                          aria-label={`Show ${day}, ${date.toLocaleDateString("en", { month: "short", day: "numeric" })}`}
                        >
                          <span>{day.slice(0, 3)}</span>
                          <strong>{dateNumber}</strong>
                        </button>
                        <div className="schedule-calendar-lane">
                          {calendarHours.map((hour) => <div className="schedule-calendar-hour" key={hour} />)}
                          {dayClasses.map((classItem) => {
                            const start = minutesOfDay(classItem.startTime);
                            const end = minutesOfDay(classItem.endTime);
                            const visibleStart = Math.max(start, calendarStartHour * 60);
                            const visibleEnd = Math.min(end, (calendarStartHour + calendarHours.length) * 60);
                            if (visibleEnd <= visibleStart) return null;
                            const SubjectIcon = subjectIcons[classItem.subject] || BookOpen;
                            return (
                              <button
                                className="schedule-calendar-event"
                                key={classItem._id}
                                onClick={() => openEditModal(classItem)}
                                style={{
                                  "--event-accent": subjectAccents[classItem.subject] || "#e7fa37",
                                  top: `${(visibleStart - calendarStartHour * 60) * calendarMinuteHeight}px`,
                                  height: `${Math.max((visibleEnd - visibleStart) * calendarMinuteHeight, 64)}px`,
                                }}
                                title={`${classItem.subject}: ${formatTime(classItem.startTime)}–${formatTime(classItem.endTime)} Bangladesh time. Click to edit or remove.`}
                              >
                                <span className="schedule-event-subject"><SubjectIcon size={13} />{classItem.subject}</span>
                                <span className="schedule-event-time">{formatTime(classItem.startTime)} – {formatTime(classItem.endTime)}</span>
                                <StudyCountdown classItem={classItem} dateKey={calendarDateKey(date)} />
                              </button>
                            );
                          })}
                          {dayClasses.length === 0 && (
                            <button className="schedule-empty-day" onClick={() => {
                              setActiveDay(day);
                              setFormData({ ...initialForm, day });
                              setEditingClass(null);
                              setShowModal(true);
                            }}>
                              <Plus size={15} /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="schedule-class-list">
                {sortedClasses.length ? sortedClasses.map(renderClassCard) : (
                  <div className="schedule-state schedule-no-results">
                    <CalendarDays size={25} />
                    <p>{searchTerm ? "No classes match your search." : "No classes scheduled here yet."}</p>
                    <button className="schedule-secondary-button" onClick={openAddModal}><Plus size={16} /> Add class</button>
                  </div>
                )}
              </div>
            )}

            {view === "week" && !loading && filteredClasses.length === 0 && (
              <div className="schedule-empty-week">
                <CalendarDays size={21} />
                <span>{searchTerm ? "No classes match your search." : "Your timetable is ready for its first class."}</span>
                <button onClick={openAddModal}><Plus size={15} /> Add class</button>
              </div>
            )}
          </section>

          <aside className="schedule-sidebar">
            <section className="schedule-side-panel schedule-mini-calendar" aria-label="Monthly calendar">
              <div className="schedule-side-heading">
                <div><span className="schedule-eyebrow">PICK A DATE</span><h2>{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2></div>
                <div className="schedule-month-controls">
                  <button type="button" aria-label="Previous calendar month" onClick={() => setCalendarMonth(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
                  <button type="button" aria-label="Next calendar month" onClick={() => setCalendarMonth(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
                </div>
              </div>
              <div className="schedule-month-weekdays" aria-hidden="true">{days.map(day => <span key={day}>{day.slice(0, 2)}</span>)}</div>
              <div className="schedule-month-days">
                {monthDays.map(date => {
                  const key = calendarDateKey(date);
                  const selected = key === calendarDateKey(selectedDate);
                  const current = key === dhakaDateKey(now);
                  const classDay = days[(date.getDay() + 6) % 7];
                  const hasClasses = classes.some(item => item.day === classDay);
                  return <button type="button" key={key} className={`${date.getMonth() !== calendarMonth.getMonth() ? "is-outside " : ""}${selected ? "is-selected " : ""}${current ? "is-today" : ""}`} aria-label={`Select ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`} aria-pressed={selected} aria-current={current ? "date" : undefined} onClick={() => { setSelectedDate(date); setCalendarMonth(date); setActiveDay("All"); }}>
                    {date.getDate()}{hasClasses && <i aria-hidden="true" />}
                  </button>;
                })}
              </div>
              <p className="schedule-month-caption">Dots mark your class days. Select a date to view its week.</p>
            </section>
            <section className="schedule-side-panel schedule-focus-panel">
              <div className="schedule-side-heading">
                <div><span className="schedule-eyebrow">YOUR NEXT UP</span><h2>Today’s focus</h2></div>
                <span className="schedule-today-date">{today.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
              </div>
              <div className="schedule-focus-count">
                <div className="schedule-focus-ring" style={{ "--focus-progress": `${todayClasses.length ? 100 : 0}%` }}>
                  <strong>{todayClasses.length}</strong><span>classes</span>
                </div>
                <div className="schedule-focus-facts">
                  <p><i className="focus-blue" /> {todayClasses.length} on today’s schedule</p>
                  <p><i className="focus-violet" /> {todayClasses.filter((classItem) => minutesOfDay(classItem.endTime) <= nowMinutes).length} completed</p>
                  <p><i className="focus-yellow" /> {nextClass ? `Next at ${formatTime(nextClass.startTime)}` : "No more classes today"}</p>
                </div>
              </div>
              {nextClass ? (
                <button className="schedule-next-class" onClick={() => openEditModal(nextClass)}>
                  <span className="schedule-next-icon"><CalendarDays size={18} /></span>
                  <span><strong>{nextClass.subject}</strong><small>{formatTime(nextClass.startTime)} · {nextClass.instructor}</small><StudyCountdown classItem={nextClass} /></span>
                  <Pencil size={15} />
                </button>
              ) : (
                <div className="schedule-focus-empty"><Check size={17} /> You’re all caught up. Nice work!</div>
              )}
              <button className="schedule-focus-add" onClick={openAddModal}><Plus size={16} /> Add a class</button>
            </section>

            <section className="schedule-side-panel schedule-subject-panel">
              <div className="schedule-side-heading">
                <div><span className="schedule-eyebrow">THE MIX</span><h2>Subject overview</h2></div>
                <BookOpen size={19} />
              </div>
              {subjectCounts.length ? (
                <div className="schedule-subject-list">
                  {subjectCounts.slice(0, 5).map(([subject, count]) => (
                    <div className="schedule-subject-row" key={subject}>
                      <span className="schedule-subject-name"><i style={{ background: subjectAccents[subject] || "#e7fa37" }} />{subject}</span>
                      <span className="schedule-subject-track"><i style={{ width: `${(count / subjectCounts[0][1]) * 100}%`, background: subjectAccents[subject] || "#e7fa37" }} /></span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="schedule-empty-subjects">Your subjects will appear here when you add a class.</p>
              )}
            </section>

            <section className="schedule-quick-action">
              <div>
                <span className="schedule-eyebrow">MAKE IT HAPPEN</span>
                <h2>Build a better week.</h2>
              </div>
              <button onClick={openAddModal}><Plus size={16} /> Add class</button>
              <span className="schedule-quick-scribble" aria-hidden="true">one step at a time ↗</span>
            </section>
          </aside>
        </div>
      </div>

      {showModal && (
        <div className="schedule-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <form className="schedule-modal" onSubmit={handleSaveClass} aria-labelledby="schedule-modal-title">
            <div className="schedule-modal-heading">
              <div>
                <span className="schedule-eyebrow">{editingClass ? "UPDATE YOUR TIMETABLE" : "MAKE IT OFFICIAL"}</span>
                <h2 id="schedule-modal-title">{editingClass ? "Edit class" : "Add a class"}</h2>
              </div>
              <button type="button" className="schedule-modal-close" onClick={closeModal} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <p className="schedule-modal-intro">All times are Bangladesh time (UTC+6). {formData.startTime && `${formatTime(formData.startTime)}${formData.endTime ? ` – ${formatTime(formData.endTime)}` : ""}`}</p>
            {editingClass && <StudyCountdown classItem={editingClass} />}
            <div className="schedule-form-grid">
              <SubjectTopicFields {...curriculum} subject={formData.subject} topic={formData.topic} onSubject={(subject) => setFormData((current) => ({ ...current, subject, topic: "" }))} onTopic={(topic) => setFormData((current) => ({ ...current, topic }))} />
              <label className="schedule-form-field schedule-form-wide">
                <span>Instructor <b>*</b></span>
                <input required value={formData.instructor} onChange={(event) => setFormData({ ...formData, instructor: event.target.value })} placeholder="Who’s teaching?" />
              </label>
              <label className="schedule-form-field schedule-form-wide">
                <span>Day <b>*</b></span>
                <select required value={formData.day} onChange={(event) => setFormData({ ...formData, day: event.target.value })}>
                  {days.map((day) => <option key={day} value={day}>{day}</option>)}
                </select>
              </label>
              <label className="schedule-form-field">
                <span>Starts <b>*</b></span>
                <input required type="time" value={formData.startTime} onChange={(event) => setFormData({ ...formData, startTime: event.target.value })} />
              </label>
              <label className="schedule-form-field">
                <span>Ends <b>*</b></span>
                <input required type="time" value={formData.endTime} onChange={(event) => setFormData({ ...formData, endTime: event.target.value })} />
              </label>
            </div>
            <div className="schedule-modal-actions">
              {editingClass && <button type="button" className="schedule-confirm-delete" disabled={saving} onClick={() => { setConfirmDelete(editingClass); setShowModal(false); }}><Trash2 size={16} />Remove class</button>}
              <button type="button" className="schedule-cancel-button" onClick={closeModal} disabled={saving}>Cancel</button>
              <button type="submit" className="schedule-submit-button" disabled={saving}>
                {saving ? "Saving…" : <><Check size={17} /> {editingClass ? "Save changes" : "Add to my week"}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="schedule-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deleting) setConfirmDelete(null);
        }}>
          <section className="schedule-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="schedule-delete-title">
            <span className="schedule-delete-mark"><Trash2 size={22} /></span>
            <span className="schedule-eyebrow">ONE LAST CHECK</span>
            <h2 id="schedule-delete-title">Remove this class?</h2>
            <p><strong>{confirmDelete.subject}</strong> will be removed from your weekly schedule. This can’t be undone.</p>
            <div className="schedule-modal-actions">
              <button className="schedule-cancel-button" onClick={() => setConfirmDelete(null)} disabled={deleting}>Keep class</button>
              <button className="schedule-confirm-delete" onClick={handleDeleteClass} disabled={deleting}>
                <Trash2 size={16} /> {deleting ? "Removing…" : "Yes, remove"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
