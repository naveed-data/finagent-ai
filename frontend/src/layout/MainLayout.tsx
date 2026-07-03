import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

type MainLayoutProps = {
  children: React.ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <TopBar />

        <main className="p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
