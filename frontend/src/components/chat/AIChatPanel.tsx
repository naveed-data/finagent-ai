import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoanApplicationForm from "./LoanApplicationForm";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  time: string;
};

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
      className={className}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

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
  const [voiceMode, setVoiceMode] = useState<"idle" | "recording" | "reviewing">("idle");
  const [hasHistory, setHasHistory] = useState(false);

  const sessionIdRef = useRef(initialSessionId ?? crypto.randomUUID());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const stopRequestedRef = useRef(false);

  const SpeechRecognitionCtor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const voiceSupported = !!SpeechRecognitionCtor;

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

  useEffect(() => {
    if (!user) {
      setHasHistory(false);
      return;
    }

    let cancelled = false;

    Promise.all([api.get("/chat-sessions"), api.get("/documents")])
      .then(([sessionsResponse, documentsResponse]) => {
        if (cancelled) return;
        const sessionCount = sessionsResponse.data.session_count ?? 0;
        const documentCount = documentsResponse.data.documents?.length ?? 0;
        setHasHistory(sessionCount > 0 || documentCount > 0);
      })
      .catch(() => {
        if (!cancelled) setHasHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

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
    } catch (err: any) {
      const sessionExpired = err?.response?.status === 401;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: sessionExpired
            ? "Your session has expired. Please sign in again."
            : "Upload failed. Please check the backend server.",
          time: getTime(),
        },
      ]);
      if (sessionExpired) onRequireAuth();
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
    } catch (err: any) {
      const sessionExpired = err?.response?.status === 401;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: sessionExpired
            ? "Your session has expired. Please sign in again."
            : "I could not connect to the backend. Please check the server.",
          time: getTime(),
        },
      ]);
      if (sessionExpired) onRequireAuth();
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

  const toggleVoiceInput = () => {
    if (!requireAuth()) return;
    if (!voiceSupported) return;

    if (voiceMode === "recording") {
      stopRequestedRef.current = true;
      recognitionRef.current?.stop();
      return;
    }

    if (voiceMode === "reviewing") return;

    setQuestion("");
    finalTranscriptRef.current = "";
    stopRequestedRef.current = false;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += `${transcript} `;
        } else {
          interim += transcript;
        }
      }
      setQuestion(`${finalTranscriptRef.current}${interim}`.trim());
    };

    recognition.onend = () => {
      if (stopRequestedRef.current) {
        setVoiceMode("reviewing");
      } else {
        // Browser paused the mic on its own (e.g. silence timeout) — keep listening
        // until the user explicitly stops, per the no-auto-stop requirement.
        try {
          recognition.start();
        } catch {
          setVoiceMode("idle");
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "audio-capture") {
        return;
      }
      stopRequestedRef.current = true;
      setVoiceMode("idle");
    };

    recognitionRef.current = recognition;
    setVoiceMode("recording");
    recognition.start();
  };

  const confirmVoiceQuery = () => {
    setVoiceMode("idle");
    askQuestion();
  };

  const cancelVoiceQuery = () => {
    setVoiceMode("idle");
    setQuestion("");
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
      onRequireAuth={() => {
        setShowApplicationForm(false);
        onRequireAuth();
      }}
    />
  );

  const inputBar = (
    <div className="flex flex-wrap items-center gap-2 bg-neutral-900 border border-neutral-700 focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30 rounded-3xl px-4 py-3 shadow-lg shadow-black/20 transition-colors">
      <input
        className="flex-1 min-w-[200px] outline-none text-sm px-2 bg-transparent text-neutral-100 placeholder:text-neutral-500"
        placeholder="Upload or fill the application, then ask about approval, risk, income, compliance..."
        value={question}
        readOnly={voiceMode === "recording"}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && voiceMode === "idle") {
            askQuestion();
          }
        }}
      />

      {voiceSupported && voiceMode !== "reviewing" && (
        <button
          type="button"
          onClick={toggleVoiceInput}
          title={voiceMode === "recording" ? "Stop recording" : "Ask by voice"}
          className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-full transition-colors ${
            voiceMode === "recording"
              ? "bg-red-500/20 text-red-400"
              : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
          }`}
        >
          <MicIcon className={voiceMode === "recording" ? "animate-pulse" : ""} />
        </button>
      )}

      {voiceMode === "reviewing" && (
        <>
          <button
            type="button"
            onClick={cancelVoiceQuery}
            title="Discard"
            className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-neutral-800 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={confirmVoiceQuery}
            title="Send"
            className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors"
          >
            ✓
          </button>
        </>
      )}

      {voiceMode === "idle" && (
        <button
          onClick={() => askQuestion()}
          disabled={loading || uploading}
          className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-50 text-white px-5 py-2 rounded-full font-medium text-sm transition-opacity shadow-lg shadow-purple-500/20"
        >
          Send
        </button>
      )}
    </div>
  );

  const quickActions = (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={triggerUpload}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-neutral-300 border border-neutral-700 hover:bg-neutral-900 transition-colors"
      >
        📎 Upload Application
      </button>
      <button
        onClick={triggerManualEntry}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-neutral-300 border border-neutral-700 hover:bg-neutral-900 transition-colors"
      >
        📝 Fill Application
      </button>
    </div>
  );

  if (!historyLoading && messages.length === 0) {
    const firstName = user?.full_name?.split(" ")[0];

    const features = [
      {
        icon: "📄",
        color: "bg-blue-500/10 text-blue-400",
        title: "Document Intelligence",
        description:
          "Upload a PDF or enter details manually — key fields are extracted automatically.",
      },
      {
        icon: "🛡️",
        color: "bg-amber-500/10 text-amber-400",
        title: "Risk & Compliance",
        description:
          "Automated risk scoring and KYC compliance checks on every application.",
      },
      {
        icon: "💬",
        color: "bg-emerald-500/10 text-emerald-400",
        title: "Instant Answers",
        description:
          "Ask about income, approval odds, or policy and get sourced, grounded answers.",
      },
      {
        icon: "🔒",
        color: "bg-purple-500/10 text-purple-400",
        title: "Private by Design",
        description:
          "Every document and conversation is isolated to your account, end to end.",
      },
    ];

    return (
      <div className="h-screen overflow-hidden flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-3xl flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 mb-4">
            🏦 Enterprise Banking Intelligence
          </span>

          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mb-6">
            {firstName && hasHistory
              ? `Let's analyze your applications, ${firstName}.`
              : "Your AI analyst for loan applications."}
          </p>

          <div className="w-full max-w-2xl">
            {inputBar}
            <div className="mt-3">{quickActions}</div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 w-full">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 text-left bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-colors"
              >
                <div
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-base ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-neutral-600">
            Powered by a local LLM · ChromaDB vector search · FastAPI
          </p>
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

      <div className="px-6 pb-6 pt-2 space-y-3">
        <div className="flex justify-center">{quickActions}</div>
        {inputBar}
      </div>

      {fileInput}
      {applicationFormModal}
    </div>
  );
}

export default AIChatPanel;
