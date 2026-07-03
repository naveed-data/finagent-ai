function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen hidden lg:flex flex-col">
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">🏦 FinAgent AI</h1>
        <p className="text-xs text-slate-400 mt-1">Banking Intelligence</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="bg-blue-600 px-4 py-3 rounded-xl font-semibold">
          📊 Dashboard
        </div>
        <div className="px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800">
          📄 Documents
        </div>
        <div className="px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800">
          🤖 AI Assistant
        </div>
        <div className="px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800">
          📈 Risk Analysis
        </div>
        <div className="px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800">
          ⚙️ Settings
        </div>
      </nav>

      <div className="px-6 py-5 border-t border-slate-800 text-xs text-slate-400">
        Ollama Local LLM Active
      </div>
    </aside>
  );
}

export default Sidebar;
