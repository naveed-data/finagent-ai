import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";
import ChatSessionList, {
  type ChatSessionSummary,
  useSessionExpansion,
} from "./ChatSessionList";

type SearchChatsPanelProps = {
  onOpenSession: (sessionId: string) => void;
  onRequireAuth: () => void;
};

function SearchChatsPanel({ onOpenSession, onRequireAuth }: SearchChatsPanelProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);

  const {
    expandedSessionId,
    sessionMessages,
    messagesLoading,
    toggleSession,
  } = useSessionExpansion();

  const deleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/chat-sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    } catch {
      // no-op: session stays in the list if deletion failed
    }
  };

  const search = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(false);
    setSearched(true);

    try {
      const response = await api.get("/chat-sessions/search", {
        params: { query },
      });
      setSessions(response.data.sessions);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card
        title="🔍 Search Chats"
        subtitle="Search previous AI questions and responses."
      >
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500 space-y-3">
          <p>Sign in to search your chat history.</p>
          <button
            onClick={onRequireAuth}
            className="bg-white hover:bg-neutral-200 text-black px-5 py-2 rounded-full text-sm font-medium"
          >
            Sign In
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="🔍 Search Chats"
      subtitle="Search previous AI questions and responses."
    >
      <div className="flex gap-3">
        <input
          className="flex-1 border border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm"
          placeholder="Search chat history..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white px-5 py-3 rounded-xl font-medium text-sm"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {!searched && (
        <div className="mt-6 border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          Search results will appear here.
        </div>
      )}

      {searched && !loading && error && (
        <div className="mt-6 border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          Could not search chat history. Please check the backend server.
        </div>
      )}

      {searched && !loading && !error && sessions.length === 0 && (
        <div className="mt-6 border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          No conversations matched "{query}".
        </div>
      )}

      {searched && !loading && !error && sessions.length > 0 && (
        <div className="mt-6">
          <ChatSessionList
            sessions={sessions}
            expandedSessionId={expandedSessionId}
            sessionMessages={sessionMessages}
            messagesLoading={messagesLoading}
            onToggleSession={toggleSession}
            onOpenSession={onOpenSession}
            onDeleteSession={deleteSession}
          />
        </div>
      )}
    </Card>
  );
}

export default SearchChatsPanel;
