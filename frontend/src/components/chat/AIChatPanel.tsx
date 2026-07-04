import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoanApplicationForm from "./LoanApplicationForm";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  time: string;
};

type AIChatPanelProps = {
  initialSessionId?: string;
  activeFilename: string | null;
  onActiveFilenameChange: (filename: string | null) => void;
  onRequireAuth: () => void;
};

function AIChatPanel({
  initialSessionId,
  activeFilename,
  onActiveFilenameChange,
  onRequireAuth,
}: AIChatPanelProps) {
  const { user } = useAuth();

  const requireAuth = () => {
    if (!user) {
      onRequireAuth();
      return false;
    }
    return true;
  };
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(!!initialSessionId);

  const sessionIdRef = useRef(initialSessionId ?? crypto.randomUUID());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getTime = (isoTimestamp?: string) =>
    new Date(isoTimestamp ?? Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    if (!initialSessionId) return;

    let cancelled = false;

    api
      .get(`/chat-sessions/${initialSessionId}`)
      .then((response) => {
        if (cancelled) return;

        type LoadedMessage = {
          role: "user" | "assistant";
          content: string;
          created_at: string;
          document_filename: string | null;
        };

        const rawMessages: LoadedMessage[] = response.data.messages;

        setMessages(
          rawMessages.map((message) => ({
            role: message.role,
            content: message.content,
            time: getTime(message.created_at),
          }))
        );

        const lastWithDocument = [...rawMessages]
          .reverse()
          .find((message) => message.document_filename);
        onActiveFilenameChange(lastWithDocument?.document_filename ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([
            {
              role: "assistant",
              content: "Could not load this conversation.",
              time: getTime(),
            },
          ]);
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadDocument = async (file: File) => {
    if (!requireAuth()) return;

    if (!file.name.endsWith(".pdf")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Only PDF files are supported.",
          time: getTime(),
        },
      ]);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", "application");

    setUploading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `Uploaded application document: ${file.name}`,
        time: getTime(),
      },
    ]);

    try {
      const response = await api.post("/documents/upload", formData);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.message,
          time: getTime(),
        },
      ]);

      onActiveFilenameChange(response.data.filename);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Upload failed. Please check the backend server.",
          time: getTime(),
        },
      ]);
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async (overrideQuestion?: string) => {
    const userQuestion = overrideQuestion ?? question;
    if (!userQuestion.trim()) return;
    if (!requireAuth()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
        time: getTime(),
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await api.get("/documents/ask", {
        params: {
          question: userQuestion,
          session_id: sessionIdRef.current,
          filename: activeFilename ?? undefined,
          top_k: 8,
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          time: getTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not connect to the backend. Please check the server.",
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const triggerUpload = () => {
    if (!requireAuth()) return;
    fileInputRef.current?.click();
  };

  const triggerManualEntry = () => {
    if (!requireAuth()) return;
    setShowApplicationForm(true);
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={(e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
          uploadDocument(selectedFile);
        }
        e.target.value = "";
      }}
    />
  );

  const applicationFormModal = showApplicationForm && (
    <LoanApplicationForm
      onClose={() => setShowApplicationForm(false)}
      onSubmitted={(message, filename) => {
        setShowApplicationForm(false);
        onActiveFilenameChange(filename);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: message, time: getTime() },
        ]);
      }}
    />
  );

  const inputBar = (
    <div className="flex flex-wrap items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-3xl px-4 py-3">
      <button
        type="button"
        onClick={triggerUpload}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
        title="Upload the applicant's PDF document"
      >
        📎 Upload
      </button>

      <button
        type="button"
        onClick={triggerManualEntry}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
        title="Enter loan application details manually"
      >
        📝 New Application
      </button>

      <input
        className="flex-1 min-w-[200px] outline-none text-sm px-2 bg-transparent text-neutral-100 placeholder:text-neutral-500"
        placeholder="Ask about approval, risk, income, compliance..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            askQuestion();
          }
        }}
      />

      <button
        onClick={() => askQuestion()}
        disabled={loading || uploading}
        className="bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black px-5 py-2 rounded-full font-medium text-sm"
      >
        Send
      </button>
    </div>
  );

  if (!historyLoading && messages.length === 0) {
    const firstName = user?.full_name?.split(" ")[0];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-normal text-neutral-100 mb-8">
          {firstName ? `Good to see you, ${firstName}.` : "Welcome to FinAgent AI."}
        </h1>

        <div className="w-full max-w-2xl">
          {inputBar}

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={triggerUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-neutral-300 border border-neutral-700 hover:bg-neutral-900"
            >
              📎 Upload Application
            </button>
            <button
              onClick={triggerManualEntry}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-neutral-300 border border-neutral-700 hover:bg-neutral-900"
            >
              📝 Enter Manually
            </button>
            <button
              onClick={() =>
                setQuestion("What can you help me with?")
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-neutral-300 border border-neutral-700 hover:bg-neutral-900"
            >
              💡 What can you help with?
            </button>
          </div>
        </div>

        {fileInput}
        {applicationFormModal}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="h-[65vh] overflow-y-auto px-6 pt-6 pb-4 space-y-4">
        {activeFilename && (
          <p className="text-xs text-neutral-500">
            Answering from:{" "}
            <span className="font-medium text-neutral-300">
              {activeFilename}
            </span>
          </p>
        )}

        {historyLoading && (
          <div className="text-center text-neutral-500 text-sm mt-24">
            Loading conversation...
          </div>
        )}

        {messages.map((message, index) => (
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
              <div
                className={`flex items-center gap-2 mb-1 text-xs ${
                  message.role === "user"
                    ? "text-neutral-500"
                    : "text-neutral-400"
                }`}
              >
                <span>
                  {message.role === "user" ? "👤 You" : "🤖 FinAgent"}
                </span>
                <span>{message.time}</span>
              </div>

              <p className="whitespace-pre-line leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {(loading || uploading) && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-neutral-400 shadow-sm">
              🤖{" "}
              {uploading ? "Indexing document..." : "FinAgent is thinking..."}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="px-6 pb-6 pt-2">{inputBar}</div>

      {fileInput}
      {applicationFormModal}
    </div>
  );
}

export default AIChatPanel;
