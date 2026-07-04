import { useAuth } from "../context/AuthContext";

type SidebarProps = {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenAuth: (mode: "signin" | "signup") => void;
};

function Sidebar({ activeView, onViewChange, onOpenAuth }: SidebarProps) {
  const { user, logout } = useAuth();

  const items = [
    { id: "new-chat", icon: "➕", label: "New Chat / Query" },
    { id: "search-chats", icon: "🔍", label: "Search Chats" },
    { id: "chat-history", icon: "💬", label: "Chat History" },
    { id: "documents", icon: "📄", label: "Uploaded Documents" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <aside className="w-72 bg-black text-neutral-200 min-h-screen hidden xl:flex flex-col border-r border-neutral-900">
      <div className="px-5 py-5">
        <h1 className="text-lg font-semibold text-white">🏦 FinAgent AI</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Banking Intelligence Assistant
        </p>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm ${
              activeView === item.id
                ? "bg-neutral-800 text-white"
                : "text-neutral-300 hover:bg-neutral-900"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-900 space-y-2">
        {user ? (
          <>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {user.full_name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onViewChange("new-chat");
              }}
              className="w-full border border-neutral-800 text-neutral-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-900"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onOpenAuth("signin")}
              className="w-full bg-white text-black px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200"
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenAuth("signup")}
              className="w-full border border-neutral-800 text-neutral-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-900"
            >
              Create Account
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
