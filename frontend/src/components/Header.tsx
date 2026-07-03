function Header() {
  return (
    <header className="bg-blue-700 text-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🏦 FinAgent AI</h1>
          <p className="text-blue-100 text-sm mt-1">
            Enterprise Banking Document Intelligence Platform
          </p>
        </div>

        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          🟢 System Online
        </div>
      </div>
    </header>
  );
}

export default Header;
