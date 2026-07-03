import MainLayout from "../layout/MainLayout";
import UploadCard from "../components/UploadCard";
import SearchCard from "../components/SearchCard";
import AskCard from "../components/AskCard";
import AnalysisCard from "../components/AnalysisCard";
import DocumentListCard from "../components/DocumentListCard";
import StatsCard from "../components/StatsCard";

function Dashboard() {
  return (
    <MainLayout>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Documents"
          value="Indexed"
          icon="📄"
          description="PDF ingestion enabled"
        />
        <StatsCard
          title="Search"
          value="Semantic"
          icon="🔍"
          description="Vector retrieval active"
        />
        <StatsCard
          title="AI Engine"
          value="Ollama"
          icon="🤖"
          description="Local LLM responses"
        />
        <StatsCard
          title="Risk Engine"
          value="Active"
          icon="📈"
          description="Loan intelligence ready"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <UploadCard />
        <SearchCard />
        <AskCard />
      </section>

      <AnalysisCard />

      <DocumentListCard />
    </MainLayout>
  );
}

export default Dashboard;
