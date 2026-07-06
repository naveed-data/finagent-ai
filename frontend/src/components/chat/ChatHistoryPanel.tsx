import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";
import ChatSessionList, {
  type ChatSessionSummary,
  useSessionExpansion,
} from "./ChatSessionList";

type ChatHistoryPanelProps = {
  onOpenSession: (sessionId: string) => void;
  onRequireAuth: () => void;
};

function ChatHistoryPanel({ onOpenSession, onRequireAuth }: ChatHistoryPanelProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get("/chat-sessions")
      .then((response) => {
        if (!cancelled) {
          setSessions(response.data.sessions);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <Card
        title="💬 History of Chats"
        subtitle="View previous conversations with FinAgent AI."
      >
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500 space-y-3">
          <p>Sign in to view your chat history.</p>
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
      title="💬 History of Chats"
      subtitle="View previous conversations with FinAgent AI."
    >
      {loading && (
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          Loading chat history...
        </div>
      )}

      {!loading && error && (
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          Could not load chat history. Please check the backend server.
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          Chat history will appear here.
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <ChatSessionList
          sessions={sessions}
          expandedSessionId={expandedSessionId}
          sessionMessages={sessionMessages}
          messagesLoading={messagesLoading}
          onToggleSession={toggleSession}
          onOpenSession={onOpenSession}
          onDeleteSession={deleteSession}
        />
      )}
    </Card>
  );
}

export default ChatHistoryPanel;
