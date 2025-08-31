import React, { useState, useEffect } from "react";
import axios from "axios";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
];

const questionTypes = ["Multiple Choice", "True/False", "Short Answer"];

const ExamPrep = () => {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [examHistory, setExamHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted) {
      handleSubmit();
    }
  }, [timeLeft, quizStarted]);

  // Enter/exit fullscreen mode
  useEffect(() => {
    if (fullScreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [fullScreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!quizStarted) return;
      
      if (e.key === 'ArrowLeft' && activeTab > 0) {
        prevQuestion();
      } else if (e.key === 'ArrowRight' && activeTab < totalQuestions() - 1) {
        nextQuestion();
      } else if (e.key === 'Escape') {
        setFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizStarted, activeTab]);

  const handleGenerate = async () => {
    if (!subject || !difficulty || !type) {
      setError("Please select subject, difficulty, and type");
      return;
    }
    setError("");
    setLoading(true);
    setQuestions(null);
    setAnswers({});
    setActiveTab(0);
    setQuizStarted(false);
    setSubmitted(false);
    setShowInstructions(false);
    setShowResults(false);

    try {
      // Map frontend question types to backend format
      const typeMapping = {
        "Multiple Choice": "mcq",
        "True/False": "trueFalse",
        "Short Answer": "short"
      };
      
      // Create a topic string that includes subject and difficulty
      const topic = `${subject} - ${difficulty} difficulty`;
      
      // Call the backend API
      const response = await axios.post("http://localhost:3000/generate-questions", {
        topic: topic
      });
      
      if (response.data.success) {
        // Filter questions based on selected type
        const filteredQuestions = {};
        const backendType = typeMapping[type];
        
        if (backendType) {
          filteredQuestions[backendType] = response.data.data[backendType] || [];
        }
        
        setQuestions(filteredQuestions);
        setQuizStarted(true);
        setSubmitted(false);
        setTimeLeft(600); // 10 minutes
        setLoading(false);
        setFullScreen(true);
      } else {
        setError("Failed to generate questions: " + response.data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Make sure backend is running.");
      setLoading(false);
    }
  };

  const handleAnswer = (qType, index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qType]: { ...prev[qType], [index]: value },
    }));
  };

  const checkAnswer = (qType, index, correct) => {
    const ans = answers[qType]?.[index];
    if (!ans) return null;
    if (qType === "short") {
      return ans.trim().toLowerCase() === correct.trim().toLowerCase();
    } else if (qType === "trueFalse") {
      return ans === correct.toString();
    } else {
      return ans === correct;
    }
  };

  const handleSubmit = () => {
    setQuizStarted(false);
    setSubmitted(true);
    setFullScreen(false);
    
    // Save to exam history
    const newScore = score();
    const examData = {
      subject,
      difficulty,
      type,
      score: newScore.correct,
      total: newScore.total,
      percentage: Math.round((newScore.correct / newScore.total) * 100),
      date: new Date().toLocaleString()
    };
    
    setExamHistory(prev => [examData, ...prev.slice(0, 4)]);
  };

  const totalQuestions = () => {
    if (type === "Multiple Choice") return questions?.mcq?.length || 0;
    if (type === "True/False") return questions?.trueFalse?.length || 0;
    if (type === "Short Answer") return questions?.short?.length || 0;
    return 0;
  };

  const nextQuestion = () => {
    if (activeTab < totalQuestions() - 1) setActiveTab(activeTab + 1);
  };

  const prevQuestion = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentQuestion = () => {
    if (type === "Multiple Choice") return questions?.mcq?.[activeTab];
    if (type === "True/False") return questions?.trueFalse?.[activeTab];
    if (type === "Short Answer") return questions?.short?.[activeTab];
    return null;
  };

  const renderQuestionNavigation = () => {
    const total = totalQuestions();
    return (
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all border-2
              ${index === activeTab ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300'} 
              ${answers[type === "Multiple Choice" ? "mcq" : type === "True/False" ? "trueFalse" : "short"]?.[index] ? 'bg-green-500 text-white border-green-500' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    );
  };

  const renderCurrentQuestion = () => {
    const q = currentQuestion();
    if (!q) return null;

    if (type === "Multiple Choice") {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
              {activeTab + 1}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{q.question}</h3>
          </div>
          <ul className="space-y-3">
            {q.options.map((opt, idx) => (
              <li key={idx}>
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${answers.mcq?.[activeTab] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                  <input
                    type="radio"
                    name={`mcq-${activeTab}`}
                    value={opt}
                    checked={answers.mcq?.[activeTab] === opt}
                    onChange={(e) =>
                      handleAnswer("mcq", activeTab, e.target.value)
                    }
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-800">{opt}</span>
                </label>
              </li>
            ))}
          </ul>
          {submitted && (
            <div className={`mt-4 p-4 rounded-lg font-semibold ${checkAnswer("mcq", activeTab, q.correct) ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
              {checkAnswer("mcq", activeTab, q.correct)
                ? "✅ Correct!"
                : `❌ Incorrect. The correct answer is: ${q.correct}`}
            </div>
          )}
        </div>
      );
    }

    if (type === "True/False") {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
              {activeTab + 1}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{q.question}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex items-center justify-center p-6 border rounded-lg cursor-pointer transition-all
              ${answers.trueFalse?.[activeTab] === "true" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
              <input
                type="radio"
                name={`tf-${activeTab}`}
                value="true"
                checked={answers.trueFalse?.[activeTab] === "true"}
                onChange={(e) =>
                  handleAnswer("trueFalse", activeTab, e.target.value)
                }
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <span className="text-lg font-semibold text-gray-800">True</span>
            </label>
            <label className={`flex items-center justify-center p-6 border rounded-lg cursor-pointer transition-all
              ${answers.trueFalse?.[activeTab] === "false" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
              <input
                type="radio"
                name={`tf-${activeTab}`}
                value="false"
                checked={answers.trueFalse?.[activeTab] === "false"}
                onChange={(e) =>
                  handleAnswer("trueFalse", activeTab, e.target.value)
                }
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <span className="text-lg font-semibold text-gray-800">False</span>
            </label>
          </div>
          {submitted && (
            <div className={`mt-4 p-4 rounded-lg font-semibold ${checkAnswer("trueFalse", activeTab, q.answer) ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
              {checkAnswer("trueFalse", activeTab, q.answer)
                ? "✅ Correct!"
                : `❌ Incorrect. The correct answer is: ${q.answer === "true" ? "True" : "False"}`}
            </div>
          )}
        </div>
      );
    }

    if (type === "Short Answer") {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
              {activeTab + 1}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{q.question}</h3>
          </div>
          <textarea
            placeholder="Type your answer here..."
            value={answers.short?.[activeTab] || ""}
            onChange={(e) =>
              handleAnswer("short", activeTab, e.target.value)
            }
            className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            rows={4}
          />
          {submitted && (
            <div className={`mt-4 p-4 rounded-lg font-semibold ${checkAnswer("short", activeTab, q.answer) ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
              {checkAnswer("short", activeTab, q.answer)
                ? "✅ Correct!"
                : `❌ Incorrect. The correct answer is: ${q.answer}`}
            </div>
          )}
        </div>
      );
    }
  };

  const score = () => {
    let correct = 0;
    const total = totalQuestions();

    if (type === "Multiple Choice") {
      questions?.mcq?.forEach((q, i) => {
        if (checkAnswer("mcq", i, q.correct)) correct++;
      });
    } else if (type === "True/False") {
      questions?.trueFalse?.forEach((q, i) => {
        if (checkAnswer("trueFalse", i, q.answer)) correct++;
      });
    } else if (type === "Short Answer") {
      questions?.short?.forEach((q, i) => {
        if (checkAnswer("short", i, q.answer)) correct++;
      });
    }

    return { correct, total };
  };

  const handleRetry = () => {
    setSubject("");
    setDifficulty("");
    setType("");
    setQuestions(null);
    setAnswers({});
    setActiveTab(0);
    setSubmitted(false);
    setError("");
    setQuizStarted(false);
    setShowInstructions(true);
    setShowResults(false);
  };

  // Calculate percentage for circular progress
  const scorePercentage = () => {
    const { correct, total } = score();
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">ExamPrep Pro</h1>
              <p className="text-gray-600">AI-Powered Exam Preparation Platform</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
              Academic Edition
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with exam history */}
          <aside className="w-full lg:w-80 bg-white rounded-lg shadow-md p-5 h-fit border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Recent Exams</h3>
            {examHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4 italic">No exam history yet</p>
            ) : (
              <ul className="space-y-3">
                {examHistory.map((exam, index) => (
                  <li key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-blue-700 font-semibold">{exam.subject}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-2xl font-bold text-gray-800">{exam.score}/{exam.total}</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${exam.percentage >= 80 ? 'bg-green-100 text-green-800' : exam.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {exam.percentage}%
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{exam.date}</div>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Main content area */}
          <div className="flex-1">
            {/* Quiz Selection Screen */}
            {!quizStarted && !questions && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create Your Custom Exam</h2>
                <p className="text-gray-600 text-center mb-6">Prepare for your tests with AI-generated questions</p>
                
                {showInstructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">How It Works</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Select your subject, difficulty level, and question type</li>
                      <li>Click "Start Exam" to begin your timed test</li>
                      <li>Answer all questions before time runs out</li>
                      <li>Review your results and explanations</li>
                      <li>Track your progress over time</li>
                    </ol>
                    <button 
                      onClick={() => setShowInstructions(false)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">📚</span> Subject
                    </label>
                    <select 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">🎯</span> Difficulty
                    </label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select Difficulty</option>
                      {["Easy", "Medium", "Hard"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">❓</span> Question Type
                    </label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select Type</option>
                      {questionTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Questions...
                    </>
                  ) : (
                    "Start Exam"
                  )}
                </button>
                {error && <p className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg font-semibold text-center">{error}</p>}
              </div>
            )}

            {/* Active Quiz Screen */}
            {quizStarted && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-semibold">{subject}</span>
                    <div className="flex items-center text-red-600 font-bold text-xl bg-red-50 py-1 px-3 rounded-lg">
                      <span className="mr-2">⏰</span>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                      <span>Question {activeTab + 1} of {totalQuestions()}</span>
                      <span>{Math.round(((activeTab + 1) / totalQuestions()) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{width: `${((activeTab + 1) / totalQuestions()) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFullScreen(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    Exit Fullscreen
                  </button>
                </div>

                {renderQuestionNavigation()}

                {renderCurrentQuestion()}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <button 
                    onClick={prevQuestion} 
                    disabled={activeTab === 0}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    ← Previous
                  </button>
                  <div className="text-gray-700 font-semibold">
                    {activeTab + 1} / {totalQuestions()}
                  </div>
                  {activeTab < totalQuestions() - 1 ? (
                    <button 
                      onClick={nextQuestion}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
                    >
                      Next →
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Result Screen */}
            {!quizStarted && questions && submitted && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Exam Completed!</h2>
                  
                  <div className="flex justify-center mb-4">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="3"
                          strokeDasharray={`${scorePercentage()}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{scorePercentage()}%</span>
                        <span className="text-sm text-gray-600">
                          <strong className="text-xl">{score().correct}</strong>/{score().total}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">
                    <strong>{score().correct}/{score().total}</strong> Correct Answers
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">Exam Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Subject:</span>
                      <span className="text-gray-600">{subject}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Difficulty:</span>
                      <span className="text-gray-600">{difficulty}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Question Type:</span>
                      <span className="text-gray-600">{type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Time Taken:</span>
                      <span className="text-gray-600">{formatTime(600 - timeLeft)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button 
                    onClick={() => setShowResults(!showResults)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex-1"
                  >
                    {showResults ? "Hide Results" : "Review Answers"}
                  </button>
                  <button 
                    onClick={handleRetry}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex-1"
                  >
                    Try Another Exam
                  </button>
                </div>

                {showResults && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">Answers Review</h4>
                    <div>
                      {renderCurrentQuestion()}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <button 
                          onClick={prevQuestion} 
                          disabled={activeTab === 0}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          ← Previous
                        </button>
                        <div className="text-gray-700 font-semibold">
                          {activeTab + 1} / {totalQuestions()}
                        </div>
                        <button 
                          onClick={nextQuestion}
                          disabled={activeTab >= totalQuestions() - 1}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ExamPrep;