import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../Context/AuthContext";
import { 
  FaPlus, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaClock, FaBook, 
  FaTrash, FaTasks, FaTimes, FaFilter, FaListUl, FaRunning, FaCheckCircle, 
  FaSync, FaChartBar, FaTrophy, FaFire, FaHome, FaBars, FaEdit, FaBell,
  FaGraduationCap, FaUserGraduate, FaRegSmileBeam, FaRegCalendarCheck,
  FaHourglassHalf, FaRegClock, FaSortAmountDownAlt, FaSearch
} from 'react-icons/fa';
import { MdSubject, MdNotes, MdAccessTime } from 'react-icons/md';
import { IoIosAddCircleOutline } from 'react-icons/io';
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

// Countdown Timer Component
const CountdownTimer = ({ deadline, timeSlot }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  function calculateTimeLeft() {
    const now = new Date();
    const taskDateTime = new Date(deadline);
    const [hours, minutes] = timeSlot.split(':');
    taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const difference = taskDateTime - now;
    
    if (difference <= 0) {
      return { overdue: true };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      overdue: false
    };
  }
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [deadline, timeSlot]);
  
  if (timeLeft.overdue) {
    return (
      <div className="flex items-center text-red-500 text-xs">
        <FaExclamationTriangle className="mr-1" /> Overdue
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-xs text-gray-600">
      <FaRegClock className="mr-1" />
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours > 0 && `${timeLeft.hours}h `}
      {timeLeft.minutes > 0 ? `${timeLeft.minutes}m` : 'Less than 1m'}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, toggleCompletion, deleteTask, editTask, getPriorityBadge, isOverdue }) => (
  <div className={`border-l-4 rounded-lg p-4 mb-3 shadow-sm transition-all duration-200 hover:shadow-md ${task.completed ? 'bg-green-50 border-green-500' : 'bg-white border-indigo-500'} ${isOverdue(task.deadline, task.timeSlot) && !task.completed ? 'border-red-500 bg-red-50' : ''}`}>
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1 rounded ${task.completed ? 'bg-green-200' : 'bg-indigo-100'}`}>
            <FaBook className={task.completed ? 'text-green-700' : 'text-indigo-700'} size={12} />
          </div>
          <h3 className={`font-semibold ${task.completed ? 'line-through text-green-700' : 'text-gray-800'}`}>
            {task.subject}: {task.topic}
          </h3>
          {getPriorityBadge(task.priority)}
          {isOverdue(task.deadline, task.timeSlot) && !task.completed && (
            <span className="flex items-center gap-1 text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full">
              <FaExclamationTriangle /> Overdue
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-2 ml-1">
          <p className="flex items-center gap-1 mb-1">
            <FaCalendarAlt className="text-indigo-500" /> 
            Due: {new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {task.timeSlot}
          </p>
          <p className="flex items-center gap-1 mb-1">
            <FaClock className="text-indigo-500" /> 
            Duration: {task.duration} minutes
          </p>
          <CountdownTimer deadline={task.deadline} timeSlot={task.timeSlot} />
          {task.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <MdNotes className="inline mr-1 text-indigo-500" />
              {task.notes}
            </div>
          )}
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
          onClick={() => editTask(task)} 
          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
          title="Edit task"
        >
          <FaEdit />
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
const BillboardCard = ({ title, count, icon, color, tasks, toggleCompletion, deleteTask, editTask, getPriorityBadge, isOverdue }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500">
              {title === 'Upcoming Tasks' ? 'Due in the next 7 days' :
               title === 'Pending Tasks' ? 'Tasks waiting for you' :
               'Tasks you have completed'}
            </p>
          </div>
        </div>
        <span className={`text-xl font-bold ${color}`}>{count}</span>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-5 bg-gray-50 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaRegSmileBeam className="text-3xl text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            {title === 'Upcoming Tasks' ? 'No upcoming tasks. Add some?' :
             title === 'Pending Tasks' ? 'No pending tasks. Great job!' :
             'No completed tasks yet. Keep going!'}
          </p>
        </div>
      ) : (
        <div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasks.slice(0, expanded ? tasks.length : 3).map(task => (
              <div key={task._id} className={`border-l-4 rounded-lg p-3 ${task.completed ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-indigo-500'} ${isOverdue(task.deadline, task.timeSlot) && !task.completed ? 'border-red-500 bg-red-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-green-700' : 'text-gray-800'}`}>
                        {task.subject}
                      </h4>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-xs text-gray-700 mb-1">{task.topic}</p>
                    <div className="text-xs text-gray-500">
                      <p className="flex items-center gap-1 mb-1">
                        <FaCalendarAlt className="text-indigo-400" /> 
                        {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {task.timeSlot}
                      </p>
                      <CountdownTimer deadline={task.deadline} timeSlot={task.timeSlot} />
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
                    <button 
                      onClick={() => editTask(task)} 
                      className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      title="Edit task"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button 
                      onClick={() => deleteTask(task._id)} 
                      className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {tasks.length > 3 && (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="w-full mt-3 text-center text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1"
            >
              {expanded ? 'Show less' : `View all ${tasks.length} tasks`}
              <FaSortAmountDownAlt />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children, title, isEditing }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-indigo-600" /> : <IoIosAddCircleOutline className="text-indigo-600" />}
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-5">
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

    const weeklyData = last7Days.map(day => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - last7Days.indexOf(day)));
      const dateString = date.toISOString().split('T')[0];
      
      return {
        day,
        tasks: tasks.filter(t => {
          const taskDate = new Date(t.deadline).toISOString().split('T')[0];
          return taskDate === dateString;
        }).length
      };
    });

    // Priority distribution
    const priorityData = [
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length }
    ];

    // Completion rate
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Study time calculation
    const totalStudyTime = tasks.reduce((total, task) => {
      return task.completed ? total + parseInt(task.duration) : total;
    }, 0);

    return { subjectChartData, weeklyData, priorityData, completionRate, totalStudyTime };
  };

  const { subjectChartData, weeklyData, priorityData, completionRate, totalStudyTime } = calculateActivityData();

  const COLORS = ['#FF4560', '#008FFB', '#00E396', '#FEB019'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FaChartBar className="text-indigo-600" /> Study Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Completion Rate Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Completion Rate</h3>
            <FaTrophy className="text-lg" />
          </div>
          <div className="text-2xl font-bold mb-1">{completionRate}%</div>
          <p className="text-indigo-100 text-xs">
            {completionRate >= 80 ? 'Excellent work! 🎉' :
             completionRate >= 50 ? 'Good progress! 👍' :
             'Keep going! 💪'}
          </p>
        </div>

        {/* Total Tasks Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Total Tasks</h3>
            <FaTasks className="text-lg text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
          <p className="text-gray-500 text-xs">All your study tasks</p>
        </div>

        {/* Study Time Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Study Time</h3>
            <MdAccessTime className="text-lg text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
          </div>
          <p className="text-gray-500 text-xs">Time spent studying</p>
        </div>

        {/* Pending Tasks Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Pending Tasks</h3>
            <FaRunning className="text-lg text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {tasks.filter(t => !t.completed).length}
          </div>
          <p className="text-gray-500 text-xs">Tasks to complete</p>
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
            <FaExclamationTriangle className="text-indigo-500" /> Task Priority
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
          <FaFire className="text-indigo-500" /> Weekly Activity
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
    <nav className="bg-white shadow-md mb-6 rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="flex items-center text-xl font-semibold text-gray-800">
              <FaGraduationCap className="text-indigo-600 mr-2" /> Study Planner
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <FaBars className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors ${
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
  toggleCompletion, deleteTask, editTask, getPriorityBadge, isOverdue, 
  fetchTasks, completedTasksCount, totalTasksCount, progressPercentage,
  formData, handleInputChange, addTask, searchTerm, setSearchTerm
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

  // Get urgent tasks (due in next 48 hours)
  const getUrgentTasks = () => {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      if (task.completed) return false;
      
      const taskDateTime = new Date(task.deadline);
      const [hours, minutes] = task.timeSlot.split(':');
      taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return taskDateTime <= in48Hours && taskDateTime >= now;
    }).sort((a, b) => {
      const aDate = new Date(a.deadline);
      const bDate = new Date(b.deadline);
      const [aHours, aMinutes] = a.timeSlot.split(':');
      const [bHours, bMinutes] = b.timeSlot.split(':');
      aDate.setHours(parseInt(aHours), parseInt(aMinutes), 0, 0);
      bDate.setHours(parseInt(bHours), parseInt(bMinutes), 0, 0);
      
      return aDate - bDate;
    });
  };

  // Billboard data
  const upcomingTasks = getThisWeekTasks();
  const pendingTasks = getPendingTasks();
  const completedTasksList = getCompletedTasks();
  const urgentTasks = getUrgentTasks();

  return (
    <>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome to Your Study Planner!</h1>
            <p className="text-indigo-100">You have {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} to complete</p>
          </div>
          <div className="hidden md:block">
            <FaUserGraduate className="text-4xl text-white opacity-80" />
          </div>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
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
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          {progressPercentage >= 80 ? "You're doing amazing! Keep it up! 🎉" :
           progressPercentage >= 50 ? "Good progress! You're more than halfway there! 👍" :
           "Every task completed is a step forward! 💪"}
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks by subject or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
          >
            <FaPlus /> Add Task
          </button>
          
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-md px-4 border border-gray-200">
            <FaFilter className="text-indigo-600" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="py-2 pl-2 pr-8 border-0 focus:ring-0 focus:outline-none bg-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billboard Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <BillboardCard 
          title="Urgent Tasks" 
          count={urgentTasks.length}
          icon={<FaBell className="text-red-500 text-xl" />}
          color="text-red-500"
          tasks={urgentTasks}
          toggleCompletion={toggleCompletion}
          deleteTask={deleteTask}
          editTask={editTask}
          getPriorityBadge={getPriorityBadge}
          isOverdue={isOverdue}
        />
        
        <BillboardCard 
          title="Upcoming Tasks" 
          count={upcomingTasks.length}
          icon={<FaCalendarAlt className="text-blue-500 text-xl" />}
          color="text-blue-500"
          tasks={upcomingTasks}
          toggleCompletion={toggleCompletion}
          deleteTask={deleteTask}
          editTask={editTask}
          getPriorityBadge={getPriorityBadge}
          isOverdue={isOverdue}
        />
        
        <BillboardCard 
          title="Pending Tasks" 
          count={pendingTasks.length}
          icon={<FaRunning className="text-orange-500 text-xl" />}
          color="text-orange-500"
          tasks={pendingTasks}
          toggleCompletion={toggleCompletion}
          deleteTask={deleteTask}
          editTask={editTask}
          getPriorityBadge={getPriorityBadge}
          isOverdue={isOverdue}
        />
        
        <BillboardCard 
          title="Completed Tasks" 
          count={completedTasksList.length}
          icon={<FaCheckCircle className="text-green-500 text-xl" />}
          color="text-green-500"
          tasks={completedTasksList}
          toggleCompletion={toggleCompletion}
          deleteTask={deleteTask}
          editTask={editTask}
          getPriorityBadge={getPriorityBadge}
          isOverdue={isOverdue}
        />
      </div>

      {/* Modal for Add/Edit Task Form */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={formData._id ? "Edit Study Task" : "Add New Study Task"} isEditing={!!formData._id}>
        <form onSubmit={addTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
            <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
              {loading ? 'Saving...' : (formData._id ? 'Update Task' : 'Add Task')}
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
  tasks, loading, filter, toggleCompletion, deleteTask, editTask, 
  getPriorityBadge, isOverdue, searchTerm 
}) => {
  // Filter tasks based on selected filter and search term
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    let statusMatch = true;
    if (filter === 'completed') statusMatch = task.completed;
    if (filter === 'pending') statusMatch = !task.completed;
    if (filter === 'urgent') {
      statusMatch = !task.completed;
      const now = new Date();
      const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const taskDateTime = new Date(task.deadline);
      const [hours, minutes] = task.timeSlot.split(':');
      taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      statusMatch = statusMatch && taskDateTime <= in48Hours && taskDateTime >= now;
    }
    
    // Filter by search term
    const searchMatch = searchTerm === '' || 
      task.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Sort all tasks by deadline
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aDate = new Date(a.deadline);
    const bDate = new Date(b.deadline);
    const [aHours, aMinutes] = a.timeSlot.split(':');
    const [bHours, bMinutes] = b.timeSlot.split(':');
    aDate.setHours(parseInt(aHours), parseInt(aMinutes), 0, 0);
    bDate.setHours(parseInt(bHours), parseInt(bMinutes), 0, 0);
    
    return aDate - bDate;
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaListUl className="text-indigo-600" />
          {filter === 'all' ? 'All Study Tasks' : 
            filter === 'pending' ? 'Pending Tasks' : 
            filter === 'completed' ? 'Completed Tasks' : 'Urgent Tasks'}
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
        <div className="text-center py-8">
          <FaRegCalendarCheck className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm ? 'No tasks match your search.' :
              filter === 'all' ? 'No tasks added yet. Start by adding a study task!' :
              filter === 'pending' ? 'No pending tasks. Great job!' :
              filter === 'urgent' ? 'No urgent tasks. Good planning!' :
              'No completed tasks yet. Keep going!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              toggleCompletion={toggleCompletion} 
              deleteTask={deleteTask} 
              editTask={editTask}
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
  const { user } = useContext(AuthContext);
  const userEmail = user?.email; 

  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  const API_BASE = import.meta.env.VITE_API_BASE;

  // Fetch tasks on mount
  useEffect(() => { 
    if(userEmail) fetchTasks(); 
  }, [userEmail]);

  const fetchTasks = async () => {
  if (!userEmail) return;
  try {
    setLoading(true);
    const response = await axios.get(`${API_BASE}/tasks`, {
      params: { email: userEmail },
      withCredentials: true  // This should be in the config object, not params
    });
    if (response.data.success) setTasks(response.data.data);
  } catch (err) {
    console.error(err);
    showToast('Server error', 'error');
  } finally {
    setLoading(false);
  }
};
  const showToast = (message, type='info') => { 
    setToast({ show:true, message, type });  
  };

  const addTask = async (e) => {
    e.preventDefault();
    if(!userEmail) return showToast('User not logged in', 'error');

    // validation
    if(!formData.subject || !formData.topic || !formData.deadline || !formData.timeSlot || !formData.duration) 
      return showToast('Fill required fields', 'error');
    if(parseInt(formData.duration)<=0) return showToast('Duration must be positive', 'error');

    try {
      setLoading(true);
      
      if (formData._id) {
        // Update existing task
        const response = await axios.put(`${API_BASE}/tasks/${formData._id}`, { 
          ...formData, 
          email: userEmail 
        });
        
        if(response.data.success){
          setTasks(tasks.map(t => t._id === formData._id ? response.data.data : t));
          setFormData({ subject:'', topic:'', priority:'medium', deadline:'', timeSlot:'', duration:'', notes:'' });
          setShowModal(false);
          showToast('Task updated successfully!', 'success');
        } else {
          showToast('Failed to update task', 'error');
        }
      } else {
        // Create new task
        const response = await axios.post(`${API_BASE}/tasks`, { ...formData, email: userEmail });
        
        if(response.data.success){
          setTasks([...tasks, response.data.data]);
          setFormData({ subject:'', topic:'', priority:'medium', deadline:'', timeSlot:'', duration:'', notes:'' });
          setShowModal(false);
          showToast('Task added successfully!', 'success');
        } else {
          showToast('Failed to add task', 'error');
        }
      }
    } catch(err){ 
      console.error(err); 
      showToast('Error saving task', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleCompletion = async (id) => {
    if(!userEmail) return;
    try{
      const taskToUpdate = tasks.find(t=>t._id===id);
      if(!taskToUpdate) return;
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
      const response = await axios.put(`${API_BASE}/tasks/${id}`, { 
        completed: updatedTask.completed, 
        email: userEmail 
      });
      
      if(response.data.success){
        setTasks(tasks.map(t=>t._id===id ? updatedTask : t));
        if(!taskToUpdate.completed){ 
          setShowConfetti(true); 
          setTimeout(()=>setShowConfetti(false),5000);
        }
        showToast('Task status updated!', 'info');
      } else {
        showToast('Failed to update task', 'error');
      }
    } catch(err){ 
      console.error(err); 
      showToast('Error updating task', 'error'); 
    }
  };

  const editTask = (task) => {
    setFormData({
      _id: task._id,
      subject: task.subject,
      topic: task.topic,
      priority: task.priority,
      deadline: task.deadline.split('T')[0], // Format date for input
      timeSlot: task.timeSlot,
      duration: task.duration,
      notes: task.notes || ''
    });
    setShowModal(true);
  };

  const deleteTask = async (id) => {
    if(!userEmail) return;
    if(!window.confirm('Are you sure you want to delete this task?')) return;
    
    try{
      const response = await axios.delete(`${API_BASE}/tasks/${id}`, { 
        params: { email: userEmail } 
      });
      
      if(response.data.success){
        setTasks(tasks.filter(t=>t._id!==id));
        showToast('Task deleted!', 'warning');
      } else {
        showToast('Failed to delete task', 'error');
      }
    } catch(err){ 
      console.error(err); 
      showToast('Error deleting task', 'error'); 
    }
  };

  // helpers
  const completedTasksCount = tasks.filter(t=>t.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount>0 ? Math.round((completedTasksCount/totalTasksCount)*100) : 0;
  
  const getPriorityBadge = priority => {
    const styles = { 
      high:'bg-red-100 text-red-800', 
      medium:'bg-orange-100 text-orange-800', 
      low:'bg-green-100 text-green-800' 
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase()+priority.slice(1)}
      </span>
    );
  };
  
  const isOverdue = (deadline, timeSlot) => { 
    const now = new Date();
    const taskDateTime = new Date(deadline);
    const [hours, minutes] = timeSlot.split(':');
    taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return taskDateTime < now;
  };
  
  const handleInputChange = e => { 
    const { name, value } = e.target; 
    setFormData({...formData, [name]: value}); 
  };

  // render active section
  const renderActiveSection = () => {
    switch(activeSection){
      case 'dashboard':
        return (
          <DashboardSection 
            tasks={tasks} loading={loading} filter={filter} setFilter={setFilter}
            showModal={showModal} setShowModal={setShowModal} 
            toggleCompletion={toggleCompletion} deleteTask={deleteTask} editTask={editTask}
            getPriorityBadge={getPriorityBadge} isOverdue={isOverdue} fetchTasks={fetchTasks}
            completedTasksCount={completedTasksCount} totalTasksCount={totalTasksCount} 
            progressPercentage={progressPercentage}
            formData={formData} handleInputChange={handleInputChange} addTask={addTask}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          />
        );
      case 'analytics': 
        return <AnalyticsSection tasks={tasks} />;
      case 'tasks':
        return (
          <TasksSection 
            tasks={tasks} loading={loading} filter={filter} 
            toggleCompletion={toggleCompletion} deleteTask={deleteTask} editTask={editTask}
            getPriorityBadge={getPriorityBadge} isOverdue={isOverdue} 
            searchTerm={searchTerm}
          />
        );
      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({...toast, show: false})} 
        />
      )}
      <div className="max-w-7xl mx-auto">
        <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default StudyPlanner;