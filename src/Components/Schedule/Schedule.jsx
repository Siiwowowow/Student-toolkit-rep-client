import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext"; // Your auth context
const subjectColors = {
  Mathematics: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", icon: "🧮" },
  Physics: { bg: "bg-red-100", border: "border-red-300", text: "text-red-800", icon: "⚛️" },
  Chemistry: { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", icon: "🧪" },
  Biology: { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", icon: "🧬" },
  "Computer Science": { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-800", icon: "💻" },
  English: { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", icon: "📚" },
  History: { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", icon: "📜" },
  Economics: { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", icon: "💹" },
  Psychology: { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-800", icon: "🧠" },
  Philosophy: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-800", icon: "🤔" },
};

const Schedule = () => {
  const { user } = useContext(AuthContext); // Assuming user.email exists
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeDay, setActiveDay] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});
  const [formData, setFormData] = useState({
    subject: "",
    instructor: "",
    day: "Monday",
    startTime: "",
    endTime: "",
    location: "",
  });

  const API_BASE = `${import.meta.env.VITE_API_BASE}/class`;

 
 // Load from backend
useEffect(() => {
  const fetchData = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}?email=${user.email}`,{ withCredentials: true });
      
      console.log("GET Response:", res.data); // Debug what's returned
      
      // Handle both response formats
      if (res.data.success) {
        // Format 1: { success: true, data: [...] }
        setClasses(res.data.data);
      } else if (Array.isArray(res.data)) {
        // Format 2: [...] (direct array)
        setClasses(res.data);
      } else {
        // Unexpected format
        console.warn("Unexpected response format:", res.data);
        setClasses([]);
      }
      
      toast.success("Schedule loaded successfully ✅");
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [user?.email]);

  // Add class
  // Add class
const handleAddClass = async () => {
  if (!formData.subject || !formData.instructor || !formData.startTime || !formData.endTime) {
    toast.error("Please fill all required fields!");
    return;
  }
  if (formData.startTime >= formData.endTime) {
    toast.error("End time must be after start time.");
    return;
  }

  const newClass = {
    ...formData,
    email: user.email,
    color: subjectColors[formData.subject] || { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-800", icon: "📝" },
  };

  try {
    const res = await axios.post(API_BASE, newClass);
    
    console.log("API Response:", res.data); // Debug what's returned
    
    // Handle both response formats
    let addedClass;
    if (res.data.success) {
      // Format 1: { success: true, data: { ...classData, _id: result.insertedId } }
      addedClass = res.data.data;
    } else if (res.data._id) {
      // Format 2: { ...classData, _id: result.insertedId } (direct object)
      addedClass = res.data;
    } else {
      // Format 3: MongoDB result object { acknowledged: true, insertedId: "..." }
      addedClass = { ...newClass, _id: res.data.insertedId || res.data._id };
    }

    setClasses([...classes, addedClass]);
    setShowModal(false);
    setFormData({ subject: "", instructor: "", day: "Monday", startTime: "", endTime: "", location: "" });
    toast.success("Class added successfully ✅");
    
  } catch (error) {
    console.error("Error adding class:", error);
    console.error("Error response:", error.response?.data);
    toast.error("Failed to add class. Please try again.");
  }
};


  // Delete class
  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col">
        <p className="font-medium">Are you sure you want to delete this class?</p>
        <div className="flex justify-end space-x-2 mt-3">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`${API_BASE}/${id}?email=${user.email}`);
                  setClasses(classes.filter((c) => c._id !== id));
                toast.success("Class deleted successfully ✅");
             
              } catch (error) {
                console.error("Error deleting class:", error);
            
                // Just a safety measure
                if (classes.find(c => c._id === id)) {
                  setClasses(classes.filter(c => c._id !== id));
                  toast.error("Failed to delete class. Please try again.");
                }
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };


  // Filter classes based on active day and search term
  const filteredClasses = classes.filter((c) => {
    const matchesDay = activeDay === "All" || c.day === activeDay;
    
    // If search term is empty, return all classes that match the day filter
    if (!searchTerm.trim()) return matchesDay;
    
    // Get the first word of the search term
    const firstWord = searchTerm.toLowerCase().split(' ')[0];
    
    // Check if any field starts with the first word of the search term
    const matchesSearch = 
      c.subject.toLowerCase().startsWith(firstWord) ||
      c.instructor.toLowerCase().startsWith(firstWord) ||
      (c.location && c.location.toLowerCase().startsWith(firstWord));
    
    return matchesDay && matchesSearch;
  });

  // Calculate statistics
  const totalHours = classes.reduce((acc, c) => {
    const start = new Date(`1970-01-01T${c.startTime}`);
    const end = new Date(`1970-01-01T${c.endTime}`);
    return acc + (end - start) / (1000 * 60 * 60);
  }, 0);

  const uniqueInstructors = [...new Set(classes.map((c) => c.instructor))].length;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const allDays = ["All", ...days];

  // Group classes by day for the weekly view
  const classesByDay = days.map(day => ({
    day,
    classes: classes
      .filter(c => c.day === day)
      .sort((a, b) => new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`))
  }));

  // Clear search function
  const clearSearch = () => {
    setSearchTerm("");
    toast.success("Search cleared ✅");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* React Hot Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.5rem',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center">
            <span className="mr-3">📚</span> Class Schedule
          </h1>
          <p className="text-gray-600 mt-1">Manage your weekly classes and track your schedule</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 text-indigo-700 p-3 rounded-xl">
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <p className="font-medium">Student Dashboard</p>
            <p className="text-sm text-gray-500">Weekly Schedule</p>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by first word of subject, instructor, or location..."
              className="w-full p-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {allDays.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setActiveDay(day);
                    if (day !== "All") {
                    toast.success(`Viewing ${day}'s schedule ✅`);
                  } else {
                    toast.success("Viewing all classes ✅");
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  activeDay === day
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-xl mr-4">
              <span className="text-indigo-600 text-xl">📖</span>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Classes</h2>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-xl mr-4">
              <span className="text-green-600 text-xl">⏱️</span>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Weekly Hours</h2>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-xl mr-4">
              <span className="text-purple-600 text-xl">👨‍🏫</span>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Unique Instructors</h2>
              <p className="text-2xl font-bold">{uniqueInstructors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class List or Weekly View based on filter */}
      {activeDay === "All" ? (
        // List view for all classes
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            All Classes {searchTerm && `- Searching for "${searchTerm}"`}
          </h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading classes...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-5xl mb-3">📅</div>
              <p>{searchTerm ? `No classes found for "${searchTerm}"` : "No classes found"}</p>
              <button 
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Your First Class
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClasses
                .sort((a, b) => {
                  // Sort by day first, then by time
                  const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
                  if (dayOrder !== 0) return dayOrder;
                  return new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`);
                })
                .map((c) => {
                  const color = subjectColors[c.subject] || { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-800", icon: "📝" };
                  return (
                    <div key={c._id} className={`p-4 rounded-xl border ${color.bg} ${color.border} ${color.text} transition-transform hover:scale-[1.02]`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">{color.icon}</span>
                            <span className="font-bold text-lg mr-2">{c.subject}</span>
                            <span className="text-xs bg-white px-2 py-1 rounded-full">
                              {c.day}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center text-sm mb-1 gap-2">
                            <span className="bg-white px-2 py-1 rounded-md">🕒 {c.startTime} - {c.endTime}</span>
                            <span className="bg-white px-2 py-1 rounded-md">👨‍🏫 {c.instructor}</span>
                            {c.location && <span className="bg-white px-2 py-1 rounded-md">📍 {c.location}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="ml-2 text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Delete class"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        // Weekly view for specific day
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            {activeDay}'s Schedule {searchTerm && `- Searching for "${searchTerm}"`}
          </h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading classes...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-5xl mb-3">📅</div>
              <p>{searchTerm ? `No classes found for "${searchTerm}" on ${activeDay}` : `No classes scheduled for ${activeDay}`}</p>
              <button 
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add a Class
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClasses  // ✅ Use null coalescing operator
                .sort((a, b) => new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`))
                .map((c) => {
                  const color = subjectColors[c.subject] || { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-800", icon: "📝" };
                  return (
                    <div key={c._id} className={`p-4 rounded-xl border ${color.bg} ${color.border} ${color.text} transition-transform hover:scale-[1.02]`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">{color.icon}</span>
                            <span className="font-bold text-lg">{c.subject}</span>
                          </div>
                          <div className="flex flex-wrap items-center text-sm mb-1 gap-2">
                            <span className="bg-white px-2 py-1 rounded-md">🕒 {c.startTime} - {c.endTime}</span>
                            <span className="bg-white px-2 py-1 rounded-md">👨‍🏫 {c.instructor}</span>
                            {c.location && <span className="bg-white px-2 py-1 rounded-md">📍 {c.location}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="ml-2 text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Delete class"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Weekly Overview */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
      <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Weekly Overview
    </h2>
    <div className="flex items-center mt-2 md:mt-0">
      <span className="text-sm text-gray-500 mr-2">Total hours:</span>
      <span className="font-semibold text-indigo-600">{totalHours.toFixed(1)}h</span>
    </div>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
    {classesByDay.map(({ day, classes }) => {
      const dayHours = classes.reduce((acc, c) => {
        const start = new Date(`1970-01-01T${c.startTime}`);
        const end = new Date(`1970-01-01T${c.endTime}`);
        return acc + (end - start) / (1000 * 60 * 60);
      }, 0);
      
      const isToday = new Date().toLocaleString('en-us', { weekday: 'long' }) === day;
      const isExpanded = !!expandedDays[day];
      
      // Determine how many classes to show in collapsed view
      const maxVisibleClasses = 2;
      const visibleClasses = isExpanded ? classes : classes.slice(0, maxVisibleClasses);
      const hasMoreClasses = classes.length > maxVisibleClasses;
      
      return (
        <div 
          key={day} 
          className={`p-3 rounded-xl border transition-all ${isToday ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50'} ${
            isExpanded ? 'row-span-2' : ''
          }`}
          style={{ 
            gridRow: isExpanded ? 'span 2' : 'auto',
            minHeight: isExpanded ? 'auto' : '200px' 
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
              {day.substring(0, 3)}
            </h3>
            <div className="flex items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${isToday ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                {classes.length} class{classes.length !== 1 ? 'es' : ''}
              </span>
              {hasMoreClasses && (
                <button 
                  onClick={() => setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }))}
                  className="ml-1 text-gray-500 hover:text-indigo-600 transition-colors"
                  title={isExpanded ? "Show less" : "Show more"}
                >
                  <svg 
                    className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Hours:</span>
              <span className="font-medium">{dayHours.toFixed(1)}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(dayHours / 8 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            {visibleClasses.length > 0 ? (
              visibleClasses
                .sort((a, b) => new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`))
                .map((c) => {
                  const color = subjectColors[c.subject] || { bg: "bg-gray-100", text: "text-gray-800", accent: "bg-gray-500" };
                  const startTime = new Date(`1970-01-01T${c.startTime}`);
                  const endTime = new Date(`1970-01-01T${c.endTime}`);
                  const duration = (endTime - startTime) / (1000 * 60 * 60);
                  
                  return (
                    <div 
                      key={c._id} 
                      className={`p-2 rounded-lg ${color.bg} ${color.text} text-xs transition-all hover:scale-[1.02] cursor-pointer`}
                      onClick={() => {
                        setActiveDay(day);
                        setSearchTerm(c.subject.split(' ')[0]);
                        document.getElementById('class-list-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="mr-1">{subjectColors[c.subject]?.icon || '📝'}</span>
                            <p className="font-semibold truncate">{c.subject}</p>
                          </div>
                          <p className="text-xs opacity-80 truncate">{c.instructor}</p>
                        </div>
                        {c.location && (
                          <span className="text-xs ml-1 opacity-70" title={c.location}>📍</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="font-medium">
                          {c.startTime} - {c.endTime}
                        </p>
                        <span className="text-xs bg-white bg-opacity-50 px-1 rounded">
                          {duration.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-3 text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs">No classes</p>
              </div>
            )}
            
            {hasMoreClasses && !isExpanded && (
              <div className="text-center pt-1">
                <span className="text-xs text-gray-500">
                  +{classes.length - maxVisibleClasses} more
                </span>
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
  
  
</div>

      {/* Add Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowModal(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center text-2xl transition-all hover:scale-110"
          title="Add new class"
        >
          +
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">➕</span>Add New Class
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Subject *</label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="">Select Subject</option>
                  {Object.keys(subjectColors).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Instructor *</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Instructor's name"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Day *</label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Start Time *</label>
                  <input
                    type="time"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">End Time *</label>
                  <input
                    type="time"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Location</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Classroom or building"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;