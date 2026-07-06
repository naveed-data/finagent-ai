import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import AIChatPanel from "../components/chat/AIChatPanel";
import ChatHistoryPanel from "../components/chat/ChatHistoryPanel";
import SearchChatsPanel from "../components/chat/SearchChatsPanel";
import AnalysisPanel from "../components/analysis/AnalysisPanel";
import RecentDocuments from "../components/documents/RecentDocuments";
import ProfileSettingsPanel from "../components/settings/ProfileSettingsPanel";
import AuthModal from "../components/auth/AuthModal";

function Dashboard() {
  const [activeView, setActiveView] = useState("new-chat");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeFilename, setActiveFilename] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<"signin" | "signup" | null>(null);

  const goToView = (view: string) => {
    if (view === "new-chat") {
      setActiveSessionId(null);
      setActiveFilename(null);
    }
    setActiveView(view);
  };

  const openChatSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setActiveFilename(null);
    setActiveView("new-chat");
  };

  const renderContent = () => {
    if (activeView === "new-chat") {
      return (
        <>
          <AIChatPanel
            key={activeSessionId ?? "new"}
            initialSessionId={activeSessionId ?? undefined}
            activeFilename={activeFilename}
            onActiveFilenameChange={setActiveFilename}
            onRequireAuth={() => setAuthModal("signin")}
          />
          {activeFilename && (
            <div className="px-6 pb-6">
              <AnalysisPanel filename={activeFilename} />
            </div>
          )}
        </>
      );
    }

    if (activeView === "search-chats") {
      return (
        <div className="p-6">
          <SearchChatsPanel
            onOpenSession={openChatSession}
            onRequireAuth={() => setAuthModal("signin")}
          />
        </div>
      );
    }

    if (activeView === "chat-history") {
      return (
        <div className="p-6">
          <ChatHistoryPanel
            onOpenSession={openChatSession}
            onRequireAuth={() => setAuthModal("signin")}
          />
        </div>
      );
    }

    if (activeView === "documents") {
      return (
        <div className="p-6">
          <RecentDocuments onRequireAuth={() => setAuthModal("signin")} />
        </div>
      );
    }

    if (activeView === "settings") {
      return (
        <div className="p-6">
          <ProfileSettingsPanel onRequireAuth={() => setAuthModal("signin")} />
        </div>
      );
    }

    return null;
  };

  return (
    <MainLayout
      activeView={activeView}
      onViewChange={goToView}
      onOpenAuth={setAuthModal}
    >
      {renderContent()}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onModeChange={setAuthModal}
        />
      )}
    </MainLayout>
  );
}

export default Dashboard;
