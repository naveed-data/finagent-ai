import { useState } from "react";
import api from "../../services/api";

export type ChatSessionSummary = {
  session_id: string;
  title: string;
  message_count: number;
  last_active: string;
};

export type ChatMessageOut = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function formatTimestamp(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function useSessionExpansion() {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );
  const [sessionMessages, setSessionMessages] = useState<ChatMessageOut[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const toggleSession = async (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      setSessionMessages([]);
      return;
    }

    setExpandedSessionId(sessionId);
    setMessagesLoading(true);

    try {
      const response = await api.get(`/chat-sessions/${sessionId}`);
      setSessionMessages(response.data.messages);
    } catch {
      setSessionMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  return { expandedSessionId, sessionMessages, messagesLoading, toggleSession };
}

type ChatSessionListProps = {
  sessions: ChatSessionSummary[];
  expandedSessionId: string | null;
  sessionMessages: ChatMessageOut[];
  messagesLoading: boolean;
  onToggleSession: (sessionId: string) => void;
  onOpenSession: (sessionId: string) => void;
};

function ChatSessionList({
  sessions,
  expandedSessionId,
  sessionMessages,
  messagesLoading,
  onToggleSession,
  onOpenSession,
}: ChatSessionListProps) {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.session_id}
          className="border border-neutral-800 rounded-xl overflow-hidden"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => onToggleSession(session.session_id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onToggleSession(session.session_id);
              }
            }}
            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-neutral-800/50 cursor-pointer"
          >
            <div>
              <p className="font-medium text-neutral-100 text-sm">
                {session.title}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {session.message_count} message
                {session.message_count === 1 ? "" : "s"} &middot;{" "}
                {formatTimestamp(session.last_active)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSession(session.session_id);
                }}
                className="text-xs font-medium text-purple-400 hover:underline whitespace-nowrap"
              >
                Continue chat →
              </button>
              <span className="text-neutral-500 text-sm">
                {expandedSessionId === session.session_id ? "▲" : "▼"}
              </span>
            </div>
          </div>

          {expandedSessionId === session.session_id && (
            <div className="border-t border-neutral-800 bg-black/30 p-4 space-y-3 max-h-96 overflow-y-auto">
              {messagesLoading && (
                <p className="text-sm text-neutral-500">Loading messages...</p>
              )}

              {!messagesLoading &&
                sessionMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        message.role === "user"
                          ? "bg-neutral-100 text-black rounded-br-sm"
                          : "bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-bl-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                        <span>
                          {message.role === "user" ? "👤 You" : "🤖 FinAgent"}
                        </span>
                        <span>{formatTimestamp(message.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ChatSessionList;
