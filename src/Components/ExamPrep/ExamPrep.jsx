import React, { useState } from "react";

const ExamPrep = () => {
  // State to hold input values
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [qaList, setQaList] = useState([]);

  // Function to add question-answer pair
  const handleAdd = () => {
    if (question.trim() && answer.trim()) {
      setQaList([...qaList, { question, answer }]);
      setQuestion("");
      setAnswer("");
    } else {
      alert("Please write both question and answer!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Exam Preparation</h1>

      {/* Input for Question */}
      <textarea
        className="w-full border rounded p-2 mb-2"
        placeholder="Write your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Input for Answer */}
      <textarea
        className="w-full border rounded p-2 mb-2"
        placeholder="Write your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      {/* Add Button */}
      <button
        onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Add Question
      </button>

      {/* Display List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Your Questions:</h2>
        {qaList.length === 0 ? (
          <p className="text-gray-500">No questions added yet.</p>
        ) : (
          <ul className="space-y-4">
            {qaList.map((item, index) => (
              <li
                key={index}
                className="border p-3 rounded shadow-sm bg-gray-50"
              >
                <p className="font-bold">Q: {item.question}</p>
                <p className="text-gray-700">A: {item.answer}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExamPrep;
