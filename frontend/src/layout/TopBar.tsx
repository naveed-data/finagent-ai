function TopBar() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Enterprise Banking AI Platform
        </h2>
        <p className="text-sm text-slate-500">
          Real-time document intelligence powered by RAG + Ollama
        </p>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
          🟢 API Online
        </span>
        <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
          🤖 LLM Active
        </span>
      </div>
    </header>
  );
}

export default TopBar;
