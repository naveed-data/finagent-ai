import { useState } from "react";
import api from "../services/api";

function AskCard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) {
      setAnswer("Please enter a question.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/documents/ask", {
        params: {
          question,
          session_id: "frontend-session",
          top_k: 8,
        },
      });

      setAnswer(response.data.answer);
    } catch {
      setAnswer("Failed to get answer. Please check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">🤖 Ask AI</h2>

      <input
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
        placeholder="Ask FinAgent AI..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        onClick={askQuestion}
        disabled={loading}
        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-5 py-3 rounded-lg font-medium"
      >
        {loading ? "Thinking..." : "Ask Question"}
      </button>

      {answer && (
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
          {answer}
        </div>
      )}
    </div>
  );
}

export default AskCard;
