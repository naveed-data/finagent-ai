import Header from "../components/Header";
import UploadCard from "../components/UploadCard";
import SearchCard from "../components/SearchCard";
import AskCard from "../components/AskCard";
import AnalysisCard from "../components/AnalysisCard";
import DocumentListCard from "../components/DocumentListCard";
import StatsCard from "../components/StatsCard";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard title="Documents" value="Indexed" icon="📄" />
          <StatsCard title="Search" value="Semantic" icon="🔍" />
          <StatsCard title="Risk Engine" value="Active" icon="📈" />
          <StatsCard title="System" value="Online" icon="🟢" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UploadCard />
          <SearchCard />
          <AskCard />
        </section>

        <AnalysisCard />

        <DocumentListCard />
      </main>
    </div>
  );
}

export default Dashboard;
