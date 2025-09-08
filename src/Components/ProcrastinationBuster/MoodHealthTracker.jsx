import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

// Constants
const icons = {
  dashboard: '📊',
  tracker: '📝',
  goals: '🎯',
  insights: '💡',
  study: '📚',
  nutrition: '🍎',
  exercise: '🏃‍♂️',
  sleep: '😴',
  water: '💧',
  mood: '😊',
  stress: '🧘‍♂️',
  schedule: '📅',
  habits: '✅',
  analytics: '📈',
  settings: '⚙️',
  calendar: '📆',
  timer: '⏱️',
  bell: '🔔',
  trophy: '🏆',
  fire: '🔥',
  star: '⭐',
};

const moods = [
  { label: '😰 Overwhelmed', value: 1, color: '#dc2626', description: 'Feeling stressed and overwhelmed' },
  { label: '😔 Low', value: 2, color: '#ea580c', description: 'Feeling down or unmotivated' },
  { label: '😐 Neutral', value: 3, color: '#eab308', description: 'Feeling okay, nothing special' },
  { label: '😊 Good', value: 4, color: '#65a30d', description: 'Feeling positive and content' },
  { label: '🎉 Excellent', value: 5, color: '#16a34a', description: 'Feeling amazing and energetic' },
];

const studySessionTypes = [
  { type: 'Deep Focus', duration: 90, break: 20, color: '#3b82f6' },
  { type: 'Regular Study', duration: 45, break: 15, color: '#06b6d4' },
  { type: 'Quick Review', duration: 25, break: 5, color: '#8b5cf6' },
  { type: 'Group Study', duration: 60, break: 10, color: '#ec4899' },
];

const goalTemplates = [
  { category: 'Sleep', goal: 'Get 7-8 hours of sleep daily', target: 7.5, unit: 'hours' },
  { category: 'Water', goal: 'Drink 8 glasses of water daily', target: 8, unit: 'glasses' },
  { category: 'Exercise', goal: 'Exercise 30 minutes daily', target: 30, unit: 'minutes' },
  { category: 'Study', goal: 'Study 4 hours daily', target: 240, unit: 'minutes' },
  { category: 'Meditation', goal: 'Meditate 10 minutes daily', target: 10, unit: 'minutes' },
];

// Utility Functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const bmi = weight / ((height / 100) ** 2);
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 24.9) category = 'Normal';
  else if (bmi < 29.9) category = 'Overweight';
  else category = 'Obese';
  return { bmi: bmi.toFixed(1), category };
};

const getStreakEmoji = (streak) => {
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '⚡';
  if (streak >= 7) return '✨';
  if (streak >= 3) return '💫';
  return '⭐';
};

// Toast Component
const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`p-4 rounded-lg shadow-lg mb-4 flex items-center space-x-3 transition-all duration-300 transform translate-x-0 ${
        type === 'success' ? 'bg-green-100 text-green-800' : type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      <span className="text-lg">{type === 'success' ? '✅' : type === 'info' ? 'ℹ️' : '⚠️'}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => onClose(id)} className="text-sm font-semibold">×</button>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-4 right-4 z-50 space-y-2">
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onClose={removeToast} />
    ))}
  </div>
);

// Components
const Header = () => (
  <div className="bg-white shadow-sm border-b sticky top-0 z-50">
   
  </div>
);

const Navigation = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'tracker', label: 'Daily Tracker', icon: icons.tracker },
    { id: 'study', label: 'Study Tools', icon: icons.study },
    { id: 'goals', label: 'Goals & Habits', icon: icons.goals },
    { id: 'insights', label: 'Insights', icon: icons.insights },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm mb-6 p-2">
      <div className="flex overflow-x-auto">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const QuickStats = ({ formData, quickActions, studyTimer, goals }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm">Today's Mood</p>
          <p className="text-2xl font-bold">{moods.find((m) => m.label === formData.mood)?.label.split(' ')[0] || '😐'}</p>
        </div>
        <div className="text-3xl opacity-80">{icons.mood}</div>
      </div>
    </div>
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-100 text-sm">Water Intake</p>
          <p className="text-2xl font-bold">{quickActions.waterGlasses}/8</p>
        </div>
        <div className="text-3xl opacity-80">{icons.water}</div>
      </div>
    </div>
    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-100 text-sm">Study Sessions</p>
          <p className="text-2xl font-bold">{studyTimer.completedSessions}</p>
        </div>
        <div className="text-3xl opacity-80">{icons.study}</div>
      </div>
    </div>
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-orange-100 text-sm">Goals Streak</p>
          <p className="text-2xl font-bold">
            {Math.max(...goals.map((g) => g.streak || 0))} {getStreakEmoji(Math.max(...goals.map((g) => g.streak || 0)))}
          </p>
        </div>
        <div className="text-3xl opacity-80">{icons.fire}</div>
      </div>
    </div>
  </div>
);

const StudyTimerWidget = ({ studyTimer, toggleTimer, resetTimer, startStudyTimer }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <span className="mr-2">{icons.timer}</span>
        Focus Timer
      </h3>
      <div className="flex items-center space-x-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            studyTimer.isBreak ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {studyTimer.isBreak ? 'Break Time' : studyTimer.sessionType.type}
        </span>
      </div>
    </div>
    <div className="flex flex-col md:flex-row items-center justify-between">
      <div className="text-center mb-4 md:mb-0">
        <div className="text-6xl font-bold text-gray-800 mb-2">{formatTime(studyTimer.timeLeft)}</div>
        <p className="text-gray-600">{studyTimer.isBreak ? 'Break time - relax!' : 'Stay focused!'}</p>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="flex space-x-3">
          <button
            onClick={toggleTimer}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              studyTimer.isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {studyTimer.isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
          >
            Reset
          </button>
        </div>
        <div className="flex space-x-2">
          {studySessionTypes.map((session, index) => (
            <button
              key={index}
              onClick={() => startStudyTimer(session)}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              style={{ borderLeft: `4px solid ${session.color}` }}
            >
              {session.duration}m
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const QuickActions = ({ addWaterGlass, setActiveTab, quickActions }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <span className="mr-2">⚡</span>
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        onClick={addWaterGlass}
        className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
      >
        <span className="text-3xl mb-2">{icons.water}</span>
        <span className="text-sm font-medium text-blue-800">Add Water</span>
        <span className="text-xs text-blue-600">{quickActions.waterGlasses} glasses</span>
      </button>
      <button
        onClick={() => setActiveTab('tracker')}
        className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all"
      >
        <span className="text-3xl mb-2">{icons.mood}</span>
        <span className="text-sm font-medium text-green-800">Log Mood</span>
        <span className="text-xs text-green-600">Track feelings</span>
      </button>
      <button
        onClick={() => setActiveTab('study')}
        className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all"
      >
        <span className="text-3xl mb-2">{icons.study}</span>
        <span className="text-sm font-medium text-purple-800">Start Study</span>
        <span className="text-xs text-purple-600">Focus session</span>
      </button>
      <button
        onClick={() => setActiveTab('goals')}
        className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all"
      >
        <span className="text-3xl mb-2">{icons.goals}</span>
        <span className="text-sm font-medium text-orange-800">Check Goals</span>
        <span className="text-xs text-orange-600">Track progress</span>
      </button>
    </div>
  </div>
);

const HabitsTracker = ({ habits, toggleHabit }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <span className="mr-2">{icons.habits}</span>
      Today's Habits
    </h3>
    <div className="space-y-3">
      {habits.map((habit) => (
        <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <button
              onClick={() => toggleHabit(habit.id)}
              className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                habit.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {habit.completed && '✓'}
            </button>
            <span className={`font-medium ${habit.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              {habit.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{habit.streak} day streak</span>
            <span className="text-lg">{getStreakEmoji(habit.streak)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const WeeklyOverviewChart = ({ chartData }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
      <span className="mr-2">{icons.analytics}</span>
      Weekly Overview
    </h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Area type="monotone" dataKey="mood" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          <Area type="monotone" dataKey="energy" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
          <Area type="monotone" dataKey="sleep" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const DailyTracker = ({ formData, handleFormChange, saveEntry, currentBMI, today }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="mr-3">{icons.tracker}</span>
        Daily Wellness Tracker
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              max={today}
              onChange={(e) => handleFormChange('date', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">How are you feeling today?</label>
            <div className="grid grid-cols-1 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleFormChange('mood', mood.label)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.mood === mood.label ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{mood.label.split(' ')[0]}</span>
                    <div>
                      <div className="font-medium text-gray-800">{mood.label.split(' ')[1]}</div>
                      <div className="text-sm text-gray-600">{mood.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Hours: <span className="text-blue-600 font-semibold">{formData.sleep} hours</span>
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={formData.sleep}
              onChange={(e) => handleFormChange('sleep', parseFloat(e.target.value))}
              className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0h</span>
              <span className={`${formData.sleep >= 7 && formData.sleep <= 9 ? 'text-green-600 font-bold' : ''}`}>
                Ideal: 7-9h
              </span>
              <span>12h</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Water Intake: <span className="text-blue-600 font-semibold">{formData.water} glasses</span>
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-8 rounded-lg ${i < formData.water ? 'bg-blue-500' : 'bg-blue-100'}`} />
              ))}
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleFormChange('water', formData.water + amount)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  +{amount}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercise: <span className="text-green-600 font-semibold">{formData.exercise} minutes</span>
            </label>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={formData.exercise}
              onChange={(e) => handleFormChange('exercise', parseInt(e.target.value))}
              className="w-full h-3 bg-green-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0min</span>
              <span className="text-green-600 font-bold">Goal: 30min</span>
              <span>3hrs</span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Time: <span className="text-purple-600 font-semibold">{Math.floor(formData.studyTime / 60)}h {formData.studyTime % 60}m</span>
            </label>
            <input
              type="range"
              min="0"
              max="480"
              step="15"
              value={formData.studyTime}
              onChange={(e) => handleFormChange('studyTime', parseInt(e.target.value))}
              className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0min</span>
              <span className="text-purple-600 font-bold">Goal: 4hrs</span>
              <span>8hrs</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stress Level: <span className="text-red-600 font-semibold">{formData.stressLevel}/5</span>
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleFormChange('stressLevel', level)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    formData.stressLevel === level ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg">{['😌', '🙂', '😐', '😰', '😫'][level - 1]}</div>
                    <div className="text-xs text-gray-600">{level}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Energy Level: <span className="text-yellow-600 font-semibold">{formData.energy}/5</span>
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleFormChange('energy', level)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    formData.energy === level ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg">{['😴', '🥱', '😐', '😊', '🚀'][level - 1]}</div>
                    <div className="text-xs text-gray-600">{level}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meditation: <span className="text-indigo-600 font-semibold">{formData.meditation} minutes</span>
            </label>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={formData.meditation}
              onChange={(e) => handleFormChange('meditation', parseInt(e.target.value))}
              className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0min</span>
              <span className="text-indigo-600 font-bold">Goal: 10min</span>
              <span>1hr</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={saveEntry}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Save Today's Entry
        </button>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">📏</span>
        Health Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleFormChange('weight', parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleFormChange('height', parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {currentBMI && (
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600">Your BMI</p>
              <p className="text-2xl font-bold text-blue-600">{currentBMI.bmi}</p>
              <p
                className={`text-sm font-medium ${
                  currentBMI.category === 'Normal'
                    ? 'text-green-600'
                    : currentBMI.category === 'Overweight'
                    ? 'text-yellow-600'
                    : currentBMI.category === 'Obese'
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`}
              >
                {currentBMI.category}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const StudyTools = ({ studyTimer, toggleTimer, resetTimer, startStudyTimer, formData }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="mr-3">{icons.timer}</span>
        Advanced Study Timer
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-6 relative">
            <div className="w-full h-full rounded-full border-8 border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">{formatTime(studyTimer.timeLeft)}</div>
                <p className="text-gray-600 mt-2">{studyTimer.isBreak ? 'Break Time' : studyTimer.sessionType.type}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                studyTimer.isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {studyTimer.isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Choose Study Session</h4>
          {studySessionTypes.map((session, index) => (
            <button
              key={index}
              onClick={() => startStudyTimer(session)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all text-left"
              style={{ borderLeft: `6px solid ${session.color}` }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium text-gray-800">{session.type}</h5>
                  <p className="text-sm text-gray-600">
                    {session.duration} min study + {session.break} min break
                  </p>
                </div>
                <div className="text-2xl">{icons.study}</div>
              </div>
            </button>
          ))}
          <div className="bg-purple-50 rounded-lg p-4 mt-6">
            <h5 className="font-semibold text-purple-800 mb-3">Today's Progress</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-700">Completed Sessions:</span>
                <span className="font-medium">{studyTimer.completedSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Total Study Time:</span>
                <span className="font-medium">{Math.floor(formData.studyTime / 60)}h {formData.studyTime % 60}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">{icons.insights}</span>
        Study Tips for Better Focus
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📚 Active Reading</h4>
          <p className="text-sm text-gray-700">Take notes, ask questions, and summarize key points while reading.</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">🎯 Goal Setting</h4>
          <p className="text-sm text-gray-700">Set specific, achievable goals for each study session.</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">🧠 Spaced Repetition</h4>
          <p className="text-sm text-gray-700">Review material at increasing intervals to improve retention.</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">🔕 Distraction-Free</h4>
          <p className="text-sm text-gray-700">Put away devices and create a clean, organized study space.</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">⏰ Time Blocking</h4>
          <p className="text-sm text-gray-700">Dedicate specific time blocks to different subjects or tasks.</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-semibold text-indigo-800 mb-2">🤝 Study Groups</h4>
          <p className="text-sm text-gray-700">Collaborate with classmates to discuss and review material.</p>
        </div>
      </div>
    </div>
  </div>
);

const GoalsAndHabits = ({ goals, habits, toggleHabit }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="mr-3">{icons.goals}</span>
        Your Wellness Goals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{goal.category}</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {goal.isCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{goal.goal}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{goal.progress.toFixed(1)} {goal.unit}</span>
                <span>{goal.target} {goal.unit}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStreakEmoji(goal.streak)}</span>
                <span className="text-sm text-gray-600">{goal.streak} day streak</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">{icons.habits}</span>
        Daily Habits Tracker
      </h3>
      <div className="space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                  habit.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {habit.completed && '✓'}
              </button>
              <div>
                <span className={`font-medium ${habit.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {habit.name}
                </span>
                <p className="text-sm text-gray-600">{habit.completed ? 'Completed today!' : 'Click to mark as done'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">{habit.streak} days</div>
                <div className="text-xs text-gray-600">Current streak</div>
              </div>
              <span className="text-2xl">{getStreakEmoji(habit.streak)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Habit Building Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Start small - consistency matters more than intensity</li>
          <li>• Stack new habits onto existing routines</li>
          <li>• Track your progress visually</li>
          <li>• Celebrate small wins along the way</li>
        </ul>
      </div>
    </div>
  </div>
);

const Insights = ({ entries, chartData }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="mr-3">{icons.insights}</span>
        Weekly Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-3xl mb-2">{icons.mood}</div>
          <h4 className="font-semibold text-blue-800 mb-1">Average Mood</h4>
          <p className="text-2xl font-bold text-blue-600">
            {entries.length > 0
              ? (entries.reduce((sum, entry) => sum + (moods.find((m) => m.label === entry.mood)?.value || 0), 0) / entries.length).toFixed(1)
              : '0'}
            /5
          </p>
          <p className="text-sm text-gray-600">This week</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-3xl mb-2">{icons.sleep}</div>
          <h4 className="font-semibold text-green-800 mb-1">Average Sleep</h4>
          <p className="text-2xl font-bold text-green-600">
            {entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.sleep, 0) / entries.length).toFixed(1) : '0'}h
          </p>
          <p className="text-sm text-gray-600">Per night</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-3xl mb-2">{icons.study}</div>
          <h4 className="font-semibold text-purple-800 mb-1">Study Time</h4>
          <p className="text-2xl font-bold text-purple-600">
            {entries.length > 0 ? Math.floor(entries.reduce((sum, entry) => sum + entry.studyTime, 0) / entries.length / 60) : '0'}h
          </p>
          <p className="text-sm text-gray-600">Daily average</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Mood & Energy Trends</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Sleep & Exercise</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sleep" fill="#8b5cf6" />
                <Bar dataKey="exercise" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">💡</span>
        Personalized Recommendations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-800">Sleep Optimization</h4>
            <p className="text-sm text-gray-700 mt-1">
              Your average sleep is{' '}
              {entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.sleep, 0) / entries.length).toFixed(1) : '0'} hours. Try to maintain
              7-9 hours for optimal performance.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800">Study Efficiency</h4>
            <p className="text-sm text-gray-700 mt-1">Consider using the Pomodoro Technique to maintain focus during study sessions.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800">Exercise Boost</h4>
            <p className="text-sm text-gray-700 mt-1">Regular exercise improves cognitive function. Try a 20-minute walk between study sessions.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800">Stress Management</h4>
            <p className="text-sm text-gray-700 mt-1">High stress levels detected. Try meditation or deep breathing exercises.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const MoodHealthTracker = () => {
  const today = new Date().toISOString().split('T')[0];

  // State Management
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    date: today,
    mood: moods[2].label,
    sleep: 7.5,
    water: 0,
    exercise: 0,
    studyTime: 0,
    meditation: 0,
    weight: 70,
    height: 170,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    stressLevel: 3,
    energy: 3,
  });
  const [studyTimer, setStudyTimer] = useState({
    isActive: false,
    timeLeft: 25 * 60,
    sessionType: studySessionTypes[2],
    isBreak: false,
    completedSessions: 0,
  });
  const [quickActions, setQuickActions] = useState({
    waterGlasses: 0,
    moodCheckedToday: false,
    studySessionActive: false,
  });
  const [toasts, setToasts] = useState([]);

  // Toast Handler
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Initial Data Setup
  useEffect(() => {
    if (entries.length === 0) {
      const sampleEntries = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          mood: moods[Math.floor(Math.random() * moods.length)].label,
          sleep: 6 + Math.random() * 3,
          water: Math.floor(Math.random() * 10) + 5,
          exercise: Math.floor(Math.random() * 60) + 15,
          studyTime: Math.floor(Math.random() * 180) + 120,
          stressLevel: Math.floor(Math.random() * 5) + 1,
          energy: Math.floor(Math.random() * 5) + 1,
        };
      });
      setEntries(sampleEntries);
    }
    if (goals.length === 0) {
      setGoals(
        goalTemplates.map((template, index) => ({
          id: index,
          ...template,
          progress: Math.random() * template.target,
          streak: Math.floor(Math.random() * 10),
          isCompleted: Math.random() > 0.5,
        }))
      );
    }
    if (habits.length === 0) {
      setHabits([
        { id: 1, name: 'Morning meditation', completed: false, streak: 5 },
        { id: 2, name: 'Drink water before meals', completed: true, streak: 12 },
        { id: 3, name: 'Evening review', completed: false, streak: 3 },
        { id: 4, name: 'Exercise', completed: true, streak: 8 },
      ]);
    }
  }, [entries.length, goals.length, habits.length]);

  // Study Timer Logic
  useEffect(() => {
    let interval = null;
    if (studyTimer.isActive && studyTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setStudyTimer((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (studyTimer.timeLeft === 0) {
      setStudyTimer((prev) => ({
        ...prev,
        isActive: false,
        isBreak: !prev.isBreak,
        timeLeft: prev.isBreak ? prev.sessionType.duration * 60 : prev.sessionType.break * 60,
        completedSessions: prev.isBreak ? prev.completedSessions + 1 : prev.completedSessions,
      }));
      if (studyTimer.isBreak) {
        addToast(`Completed ${studyTimer.sessionType.type} session!`, 'success');
      }
    }
    return () => clearInterval(interval);
  }, [studyTimer.isActive, studyTimer.timeLeft, studyTimer.isBreak, studyTimer.sessionType, today]);

  // Handlers
  const toggleHabit = (habitId) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completed: !habit.completed,
              streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            }
          : habit
      )
    );
    const habit = habits.find((h) => h.id === habitId);
    addToast(`${habit?.name} marked as ${!habit?.completed ? 'completed' : 'incomplete'}!`, 'success');
  };

  const addWaterGlass = () => {
    setQuickActions((prev) => ({
      ...prev,
      waterGlasses: prev.waterGlasses + 1,
    }));
    setFormData((prev) => ({
      ...prev,
      water: prev.water + 1,
    }));
    addToast('Added a glass of water!', 'info');
  };

  const startStudyTimer = (sessionType) => {
    setStudyTimer({
      isActive: true,
      timeLeft: sessionType.duration * 60,
      sessionType,
      isBreak: false,
      completedSessions: studyTimer.completedSessions,
    });
    setQuickActions((prev) => ({
      ...prev,
      studySessionActive: true,
    }));
  };

  const toggleTimer = () => {
    setStudyTimer((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const resetTimer = () => {
    setStudyTimer({
      isActive: false,
      timeLeft: 25 * 60,
      sessionType: studySessionTypes[2],
      isBreak: false,
      completedSessions: 0,
    });
    setQuickActions((prev) => ({
      ...prev,
      studySessionActive: false,
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEntry = () => {
    const existingIndex = entries.findIndex((e) => e.date === formData.date);
    const newEntry = {
      ...formData,
      sleep: Number(formData.sleep),
      water: Number(formData.water),
      exercise: Number(formData.exercise),
      studyTime: Number(formData.studyTime),
      meditation: Number(formData.meditation),
      weight: Number(formData.weight),
      height: Number(formData.height),
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fats: Number(formData.fats),
      stressLevel: Number(formData.stressLevel),
      energy: Number(formData.energy),
    };
    if (existingIndex >= 0) {
      const updated = [...entries];
      updated[existingIndex] = newEntry;
      setEntries(updated);
      addToast('Updated today\'s entry!', 'success');
    } else {
      setEntries([...entries, newEntry]);
      addToast('Saved today\'s entry!', 'success');
    }
  };

  // Chart Data Preparation
  const chartData = entries
    .slice(0, 7)
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: moods.find((m) => m.label === entry.mood)?.value || 0,
      sleep: entry.sleep,
      water: entry.water,
      exercise: entry.exercise,
      studyTime: entry.studyTime / 60,
      stress: entry.stressLevel,
      energy: entry.energy,
    }))
    .reverse();

  const currentBMI = calculateBMI(formData.weight, formData.height);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <QuickStats formData={formData} quickActions={quickActions} studyTimer={studyTimer} goals={goals} />
            <StudyTimerWidget studyTimer={studyTimer} toggleTimer={toggleTimer} resetTimer={resetTimer} startStudyTimer={startStudyTimer} />
            <QuickActions addWaterGlass={addWaterGlass} setActiveTab={setActiveTab} quickActions={quickActions} />
            <HabitsTracker habits={habits} toggleHabit={toggleHabit} />
            <WeeklyOverviewChart chartData={chartData} />
          </div>
        )}
        {activeTab === 'tracker' && (
          <DailyTracker formData={formData} handleFormChange={handleFormChange} saveEntry={saveEntry} currentBMI={currentBMI} today={today} />
        )}
        {activeTab === 'study' && (
          <StudyTools studyTimer={studyTimer} toggleTimer={toggleTimer} resetTimer={resetTimer} startStudyTimer={startStudyTimer} formData={formData} />
        )}
        {activeTab === 'goals' && <GoalsAndHabits goals={goals} habits={habits} toggleHabit={toggleHabit} />}
        {activeTab === 'insights' && <Insights entries={entries} chartData={chartData} />}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
};

export default MoodHealthTracker;