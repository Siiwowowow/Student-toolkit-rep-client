import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../Context/AuthContext";
import { 
  FaPlus, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaClock, FaBook, 
  FaTrash, FaTasks, FaTimes, FaFilter, FaListUl, FaRunning, FaCheckCircle, 
  FaSync, FaChartBar, FaTrophy, FaFire, FaHome, FaBars 
} from 'react-icons/fa';
import { MdSubject, MdNotes } from 'react-icons/md';
import Confetti from 'react-confetti';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 z-50`}>
      <div className="flex items-center">
        <span className="mr-2">{message}</span>
        <button onClick={onClose} className="text-white">
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, toggleCompletion, deleteTask, getPriorityBadge, isOverdue }) => (
  <div className={`border-l-4 rounded-r p-4 mb-3 ${task.completed ? 'bg-green-50 border-green-500' : 'bg-white border-indigo-500'} ${isOverdue(task.deadline) && !task.completed ? 'border-red-500 bg-red-50' : ''}`}>
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold ${task.completed ? 'line-through text-green-700' : 'text-gray-800'}`}>
            {task.subject}: {task.topic}
          </h3>
          {getPriorityBadge(task.priority)}
          {isOverdue(task.deadline) && !task.completed && (
            <span className="flex items-center gap-1 text-red-600 text-sm">
              <FaExclamationTriangle /> Overdue
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          <p className="flex items-center gap-1">
            <FaCalendarAlt className="text-indigo-500" /> Due: {new Date(task.deadline).toLocaleDateString()} at {task.timeSlot}
          </p>
          <p className="flex items-center gap-1">
            <FaClock className="text-indigo-500" /> Duration: {task.duration} minutes
          </p>
          {task.notes && <p className="mt-1">{task.notes}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => toggleCompletion(task._id)} 
          className={`p-2 rounded-full ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:bg-green-200 hover:text-green-700 transition-colors`}
          title={task.completed ? 'Mark as pending' : 'Mark as completed'}
        >
          <FaCheck />
        </button>
        <button 
          onClick={() => deleteTask(task._id)} 
          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
          title="Delete task"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  </div>
);

// Billboard Card Component
const BillboardCard = ({ title, count, icon, color, tasks, toggleCompletion, getPriorityBadge, isOverdue }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <span className={`text-lg font-bold ${color}`}>{count}</span>
    </div>
    
    {tasks.length === 0 ? (
      <p className="text-gray-500 text-center py-4">
        {title === 'Upcoming Tasks' ? 'No upcoming tasks.' :
         title === 'Pending Tasks' ? 'No pending tasks. Great job!' :
         'No completed tasks yet. Keep going!'}
      </p>
    ) : (
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {tasks.map(task => (
          <div key={task._id} className={`border-l-4 rounded-r p-3 ${task.completed ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-indigo-500'} ${isOverdue(task.deadline) && !task.completed ? 'border-red-500 bg-red-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-green-700' : 'text-gray-800'}`}>
                    {task.subject}: {task.topic}
                  </h4>
                  {getPriorityBadge(task.priority)}
                </div>
                <div className="text-xs text-gray-500">
                  <p className="flex items-center gap-1">
                    <FaCalendarAlt className="text-indigo-400" /> 
                    {new Date(task.deadline).toLocaleDateString()} at {task.timeSlot}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => toggleCompletion(task._id)} 
                  className={`p-1 rounded-full ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:bg-green-200 hover:text-green-700 transition-colors`}
                  title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                >
                  <FaCheck size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Study Task</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Student Activity Chart Component
const StudentActivityChart = ({ tasks }) => {
  // Calculate activity data for charts
  const calculateActivityData = () => {
    // Group tasks by subject
    const subjectData = tasks.reduce((acc, task) => {
      if (!acc[task.subject]) {
        acc[task.subject] = { completed: 0, pending: 0, total: 0 };
      }
      if (task.completed) {
        acc[task.subject].completed++;
      } else {
        acc[task.subject].pending++;
      }
      acc[task.subject].total++;
      return acc;
    }, {});

    // Convert to array for charts
    const subjectChartData = Object.keys(subjectData).map(subject => ({
      subject,
      completed: subjectData[subject].completed,
      pending: subjectData[subject].pending,
      total: subjectData[subject].total
    }));

    // Weekly activity data (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    const weeklyData = last7Days.map(day => ({
      day,
      tasks: Math.floor(Math.random() * 6) // Random data for demo
    }));

    // Priority distribution
    const priorityData = [
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length }
    ];

    // Completion rate
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return { subjectChartData, weeklyData, priorityData, completionRate };
  };

  const { subjectChartData, weeklyData, priorityData, completionRate } = calculateActivityData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FaChartBar className="text-indigo-600" /> Student Activity Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Completion Rate Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Completion Rate</h3>
            <FaTrophy className="text-2xl" />
          </div>
          <div className="text-3xl font-bold mb-2">{completionRate}%</div>
          <p className="text-indigo-100">
            {completionRate >= 80 ? 'Excellent work! Keep it up!' :
             completionRate >= 50 ? 'Good progress! Almost there!' :
             'Keep going! You can do it!'}
          </p>
        </div>

        {/* Stats Overview Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{tasks.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => !t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => new Date(t.deadline) < new Date() && !t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subjects Bar Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBook className="text-indigo-500" /> Tasks by Subject
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#10B981" />
                <Bar dataKey="pending" name="Pending" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-indigo-500" /> Task Priority Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFire className="text-indigo-500" /> Weekly Activity Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="tasks" stroke="#6366F1" fill="#818CF8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeSection, setActiveSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome className="mr-2" /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar className="mr-2" /> },
    { id: 'tasks', label: 'All Tasks', icon: <FaListUl className="mr-2" /> }
  ];

  return (
    <nav className="bg-white shadow-md mb-6 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="flex items-center text-xl font-semibold text-gray-800">
              <FaBook className="text-indigo-600 mr-2" /> Study Planner
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  activeSection === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <FaBars className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  activeSection === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Dashboard Section Component
const DashboardSection = ({ 
  tasks, loading, filter, setFilter, showModal, setShowModal, 
  toggleCompletion,  getPriorityBadge, isOverdue, 
  fetchTasks, completedTasksCount, totalTasksCount, progressPercentage,
  formData, handleInputChange, addTask 
}) => {
  // Get tasks due this week (next 7 days)
  const getThisWeekTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today && taskDate <= nextWeek && !task.completed;
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  };

  // Get pending tasks
  const getPendingTasks = () => {
    return tasks.filter(task => !task.completed)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  };

  // Get completed tasks
  const getCompletedTasks = () => {
    return tasks.filter(task => task.completed)
      .sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  };

  // Billboard data
  const upcomingTasks = getThisWeekTasks();
  const pendingTasks = getPendingTasks();
  const completedTasksList = getCompletedTasks();

  return (
    <>
      {/* Progress Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaTasks className="text-indigo-600" /> Progress Overview
          </h2>
          <button
            onClick={fetchTasks}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
            title="Refresh tasks"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600">Completed: <span className="font-semibold text-green-600">{completedTasksCount}/{totalTasksCount}</span></p>
            <p className="text-gray-600">Pending: <span className="font-semibold text-orange-600">{totalTasksCount - completedTasksCount}</span></p>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{progressPercentage}%</div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <FaPlus /> Add Study Task
        </button>
        
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-4">
          <FaFilter className="text-indigo-600" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="py-2 pl-2 pr-8 border-0 focus:ring-0 focus:outline-none"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Billboard Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <BillboardCard 
          title="Upcoming Tasks" 
          count={upcomingTasks.length}
          icon={<FaCalendarAlt className="text-blue-500 text-xl" />}
          color="text-blue-500"
          tasks={upcomingTasks.slice(0, 5)}
          toggleCompletion={toggleCompletion}
          getPriorityBadge={getPriorityBadge}
          isOverdue={isOverdue}
        />
        
        <BillboardCard 
          title="Pending Tasks" 
          count={pendingTasks.length}
          icon={<FaRunning className="text-orange-500 text-xl" />}
          color="text-orange-500"
          tasks={pendingTasks.slice(0, 5)}
          toggleCompletion={toggleCompletion}
          getPriorityBadge={getPriorityBadge}
          isOverdue={isOverdue}
        />
        
        <BillboardCard 
          title="Completed Tasks" 
          count={completedTasksList.length}
          icon={<FaCheckCircle className="text-green-500 text-xl" />}
          color="text-green-500"
          tasks={completedTasksList.slice(0, 5)}
          toggleCompletion={toggleCompletion}
          getPriorityBadge={getPriorityBadge}
          isOverdue={isOverdue}
        />
      </div>

      {/* Modal for Add Task Form */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={addTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MdSubject className="text-indigo-600" /> Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Mathematics"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Calculus"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FaCalendarAlt className="text-indigo-600" /> Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Slot *
              </label>
              <input
                type="time"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FaClock className="text-indigo-600" /> Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 60"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MdNotes className="text-indigo-600" /> Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Additional details about this task..."
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

// Analytics Section Component
const AnalyticsSection = ({ tasks }) => (
  <StudentActivityChart tasks={tasks} />
);

// Tasks Section Component
const TasksSection = ({ 
  tasks, loading, filter, toggleCompletion, deleteTask, 
  getPriorityBadge, isOverdue 
}) => {
  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true; // 'all'
  });

  // Sort all tasks by deadline
  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaListUl className="text-indigo-600" />
          {filter === 'all' ? 'All Study Tasks' : 
            filter === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
        </h2>
        <span className="text-sm text-gray-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <FaSync className="animate-spin text-indigo-600 text-2xl" />
        </div>
      ) : sortedTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {filter === 'all' ? 'No tasks added yet. Start by adding a study task!' :
            filter === 'pending' ? 'No pending tasks. Great job!' :
            'No completed tasks yet. Keep going!'}
        </p>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              toggleCompletion={toggleCompletion} 
              deleteTask={deleteTask} 
              getPriorityBadge={getPriorityBadge} 
              isOverdue={isOverdue} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StudyPlanner = () => {
  const { user } = useContext(AuthContext); // user.email should be available
  const userEmail = user?.email; 

  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [filter, setFilter] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    priority: 'medium',
    deadline: '',
    timeSlot: '',
    duration: '',
    notes: ''
  });

  const API_BASE_URL = 'http://localhost:3000';

  // Sound hooks (unchanged)
  const useSound = (src, volume = 0.5) => {
    const soundRef = useRef(null);
    useEffect(() => { soundRef.current = new Audio(src); soundRef.current.volume = volume; }, [src, volume]);
    return () => { if(soundRef.current){soundRef.current.currentTime=0; soundRef.current.play();} };
  };
  const playAddSound = useSound('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
  const playDeleteSound = useSound('https://assets.mixkit.co/sfx/preview/mixkit-click-error-1110.mp3');
  const playCompleteSound = useSound('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
  const playCongratsSound = useSound('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
  const playNotifySound = useSound('https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3');

  // Fetch tasks on mount
  useEffect(() => { if(userEmail) fetchTasks(); }, [userEmail]);

  const fetchTasks = async () => {
    if(!userEmail) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/study-tasks`, { params: { email: userEmail } });
      if(response.data.success) setTasks(response.data.data);
      else showToast('Failed to fetch tasks', 'error');
    } catch(err) {
      console.error(err);
      showToast('Server error', 'error');
    } finally { setLoading(false); }
  };

  const showToast = (message, type='info') => { setToast({ show:true, message, type }); playNotifySound(); };

  const addTask = async (e) => {
    e.preventDefault();
    if(!userEmail) return showToast('User not logged in', 'error');

    // validation
    if(!formData.subject || !formData.topic || !formData.deadline || !formData.timeSlot || !formData.duration) return showToast('Fill required fields', 'error');
    if(parseInt(formData.duration)<=0) return showToast('Duration must be positive', 'error');

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/study-tasks`, { ...formData, email: userEmail });
      if(response.data.success){
        setTasks([...tasks, response.data.data]);
        setFormData({ subject:'', topic:'', priority:'medium', deadline:'', timeSlot:'', duration:'', notes:'' });
        setShowModal(false);
        playAddSound();
        showToast('Task added!', 'success');
      } else showToast('Failed to add task', 'error');
    } catch(err){ console.error(err); showToast('Error adding task', 'error'); } finally { setLoading(false); }
  };

  const toggleCompletion = async (id) => {
    if(!userEmail) return;
    try{
      const taskToUpdate = tasks.find(t=>t._id===id);
      if(!taskToUpdate) return;
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
      const response = await axios.put(`${API_BASE_URL}/study-tasks/${id}`, { completed: updatedTask.completed, email: userEmail });
      if(response.data.success){
        setTasks(tasks.map(t=>t._id===id ? updatedTask : t));
        if(!taskToUpdate.completed){ setShowConfetti(true); playCongratsSound(); setTimeout(()=>setShowConfetti(false),5000);}
        playCompleteSound();
        showToast('Task status updated!', 'info');
      } else showToast('Failed to update task', 'error');
    } catch(err){ console.error(err); showToast('Error updating task', 'error'); }
  };

  const deleteTask = async (id) => {
    if(!userEmail) return;
    try{
      const response = await axios.delete(`${API_BASE_URL}/study-tasks/${id}`, { params:{ email: userEmail } });
      if(response.data.success){
        setTasks(tasks.filter(t=>t._id!==id));
        playDeleteSound();
        showToast('Task deleted!', 'warning');
      } else showToast('Failed to delete task', 'error');
    } catch(err){ console.error(err); showToast('Error deleting task', 'error'); }
  };

  // helpers
  const completedTasksCount = tasks.filter(t=>t.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount>0 ? Math.round((completedTasksCount/totalTasksCount)*100) : 0;
  const getPriorityBadge = priority => {
    const styles = { high:'bg-red-100 text-red-800', medium:'bg-orange-100 text-orange-800', low:'bg-green-100 text-green-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[priority]}`}>{priority.charAt(0).toUpperCase()+priority.slice(1)}</span>;
  };
  const isOverdue = deadline => { const today = new Date(); today.setHours(0,0,0,0); const d=new Date(deadline); d.setHours(0,0,0,0); return d<today; };
  const handleInputChange = e => { const { name,value }=e.target; setFormData({...formData,[name]:value}); };

  // render active section
  const renderActiveSection = () => {
    switch(activeSection){
      case 'dashboard':
        return (
          <DashboardSection 
            tasks={tasks} loading={loading} filter={filter} setFilter={setFilter}
            showModal={showModal} setShowModal={setShowModal} toggleCompletion={toggleCompletion} deleteTask={deleteTask}
            getPriorityBadge={getPriorityBadge} isOverdue={isOverdue} fetchTasks={fetchTasks}
            completedTasksCount={completedTasksCount} totalTasksCount={totalTasksCount} progressPercentage={progressPercentage}
            formData={formData} handleInputChange={handleInputChange} addTask={addTask}
          />
        );
      case 'analytics': return <AnalyticsSection tasks={tasks} />;
      case 'tasks':
        return <TasksSection tasks={tasks} loading={loading} filter={filter} toggleCompletion={toggleCompletion} deleteTask={deleteTask} getPriorityBadge={getPriorityBadge} isOverdue={isOverdue} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={()=>setToast({...toast, show:false})} />}
      <div className="max-w-7xl mx-auto">
        <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default StudyPlanner;
