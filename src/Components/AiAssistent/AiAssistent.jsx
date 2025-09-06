import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const AiAssistant = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);

  // Sample suggestions for user
  const suggestions = [
    "What can you help me with?",
    "Tell me a joke",
    "How does AI work?",
    "Recommend a good book"
  ];

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = async (msg = message) => {
    const messageToSend = msg || message;
    if (!messageToSend.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = messageToSend.trim();
    setChat((prev) => [...prev, { sender: "user", text: userMessage, timestamp: new Date() }]);
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you would use your API endpoint
      const res = await axios.post("https://real-time-chat-server-rosy.vercel.app/ai-chat", {
        message: userMessage,
      });

      setChat((prev) => [...prev, { 
        sender: "bot", 
        text: res.data.reply, 
        timestamp: new Date() 
      }]);
    } catch (err) {
      console.log(err)
      setError("Unable to connect to the AI service. Please try again.");
      setChat((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: "I'm having trouble connecting right now. Please try again in a moment.", 
          timestamp: new Date() 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setChat([]);
    setError(null);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full mx-auto h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-5 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Assistant</h3>
            <div className="flex items-center mt-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${isLoading ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
              <span className="text-sm">{isLoading ? "Typing..." : "Online"}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={clearChat} 
            title="Clear chat"
            className="text-white hover:text-blue-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button title="Settings" className="text-white hover:text-blue-200 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-5 bg-gray-50"
      >
        {chat.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Hello! I'm your AI Assistant</h3>
            <p className="text-gray-600">How can I help you today?</p>
          </div>
        ) : (
          chat.map((c, idx) => (
            <div
              key={idx}
              className={`flex mb-4 ${c.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col max-w-xs lg:max-w-md">
                <div className={`rounded-2xl px-4 py-3 ${c.sender === "user" 
                  ? "bg-blue-600 text-white rounded-br-md" 
                  : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200"}`}
                >
                  <p className="whitespace-pre-wrap">{c.text}</p>
                </div>
                <span className={`text-xs mt-1 ${c.sender === "user" ? "text-right text-gray-500" : "text-gray-400"}`}>
                  {formatTime(c.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {chat.length === 0 && (
        <div className="flex flex-wrap gap-2 mt-2 px-4 pb-4 bg-white border-t border-gray-200">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="bg-blue-50 text-blue-600 border-none rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !message.trim()}
            className={`bg-blue-600 text-white rounded-r-full px-5 py-3 flex items-center justify-center transition-colors ${isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm flex items-center border-t border-red-100">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default AiAssistant;