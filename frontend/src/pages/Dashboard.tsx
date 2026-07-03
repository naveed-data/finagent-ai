import Header from "../components/Header";
import UploadCard from "../components/UploadCard";
import SearchCard from "../components/SearchCard";
import AskCard from "../components/AskCard";
import AnalysisCard from "../components/AnalysisCard";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <UploadCard />
          <SearchCard />
          <AskCard />
        </div>

        <AnalysisCard />
      </main>
    </div>
  );
}

export default Dashboard;
