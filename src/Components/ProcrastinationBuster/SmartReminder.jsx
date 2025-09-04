'use client';
import React, { useState, useEffect } from "react";
import { FaBell, FaPlus } from 'react-icons/fa';

// Sample data for demonstration (replace with your dynamic data from a backend)
const sampleTasks = [
  { id: 1, title: "Math Lecture", type: "class", datetime: "2025-09-03T10:00", reminderMinutesBefore: 10 },
  { id: 2, title: "History Assignment", type: "task", datetime: "2025-09-03T17:00", reminderMinutesBefore: 30 },
  { id: 3, title: "Budget Review", type: "budget", datetime: "2025-09-05T09:00", reminderMinutesBefore: 15 },
];

const SmartReminder = () => {
  const [tasks, setTasks] = useState(() => {
    // Load tasks from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("reminderTasks");
      return saved ? JSON.parse(saved) : sampleTasks;
    }
    return sampleTasks;
  });

  const [newTask, setNewTask] = useState({
    title: "",
    type: "task",
    datetime: "",
    reminderMinutesBefore: 10
  });

  const [error, setError] = useState("");

  // --- Data Persistence and Initialization ---
  useEffect(() => {
    // Save tasks to localStorage whenever the 'tasks' state changes
    localStorage.setItem("reminderTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // Request Notification permission when the component mounts
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // --- Notification Logic ---
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((task) => {
        const taskTime = new Date(task.datetime);
        const reminderTime = new Date(taskTime.getTime() - task.reminderMinutesBefore * 60000);

        // Check if the reminder time is within the last second to trigger a notification
        if (now.getTime() >= reminderTime.getTime() && now.getTime() < reminderTime.getTime() + 1000) {
          if (Notification.permission === "granted") {
            new Notification(`Reminder: ${task.title}`, {
              body: `Type: ${task.type} | Scheduled for ${taskTime.toLocaleTimeString()}`,
            });
          }
        }
      });
    };

    // Check reminders every second for precise timing
    const interval = setInterval(checkReminders, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  // --- Form Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.datetime) {
      setError("Please enter a title and a valid date/time.");
      return;
    }

    const taskDate = new Date(newTask.datetime);
    if (isNaN(taskDate.getTime())) {
      setError("Invalid date and time format.");
      return;
    }

    if (newTask.reminderMinutesBefore < 0) {
      setError("Reminder minutes cannot be a negative value.");
      return;
    }

    // Add a new task with a unique ID
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({
      title: "",
      type: "task",
      datetime: "",
      reminderMinutesBefore: 10
    });
    setError("");
  };

  // --- AI Suggestions (A simple logic for demonstration) ---
  const aiSuggestions = [];
  const today = new Date();
  if (today.getDay() === 5) { // Friday
    aiSuggestions.push("It's Friday, which is a great time to review your weekly budget and plan for the weekend.");
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto my-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaBell className="mr-2 text-purple-600" /> Smart Reminder System
        </h2>
      </div>

      {/* Task Creation Form */}
      <form className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50" onSubmit={handleAddTask}>
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={newTask.title}
            onChange={handleChange}
            placeholder="Task / Class / Exam Title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-800"
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            value={newTask.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-800"
          >
            <option value="task">Task</option>
            <option value="class">Class</option>
            <option value="exam">Exam</option>
            <option value="budget">Budget</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            id="datetime"
            name="datetime"
            value={newTask.datetime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-800"
            required
          />
        </div>
        <div>
          <label htmlFor="minutes" className="block text-sm font-medium text-gray-700">Remind (min before)</label>
          <input
            type="number"
            id="minutes"
            name="reminderMinutesBefore"
            value={newTask.reminderMinutesBefore}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-800"
          />
        </div>
        <button
          type="submit"
          className="col-span-1 md:col-span-6 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          <FaPlus className="mr-2" /> Add Reminder
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* AI Suggestions Section */}
      {aiSuggestions.length > 0 && (
        <div className="ai-suggestions bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded-lg">
          <h3 className="font-semibold text-purple-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 112 0v2a1 1 0 11-2 0V6zm-2 2a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd" />
            </svg>
            Smart Suggestions:
          </h3>
          <ul className="mt-2 list-disc list-inside text-gray-700">
            {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Upcoming Reminders List */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Reminders</h3>
        <ul className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
                <div className="flex-1">
                  <strong className="text-lg text-gray-800">{task.title}</strong>
                  <span className="text-sm text-gray-500 block md:inline md:ml-2">({task.type})</span>
                </div>
                <div className="mt-2 md:mt-0 text-sm text-gray-600">
                  <span className="bg-purple-200 text-purple-800 font-medium px-2 py-1 rounded-full text-xs">
                    Reminder {task.reminderMinutesBefore} min before
                  </span>
                  <span className="ml-2 font-medium">at {new Date(task.datetime).toLocaleString()}</span>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No reminders set. Add one above!</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SmartReminder;