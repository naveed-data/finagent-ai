import Sidebar from "./Sidebar";

type MainLayoutProps = {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenAuth: (mode: "signin" | "signup") => void;
};

function MainLayout({
  children,
  activeView,
  onViewChange,
  onOpenAuth,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        onOpenAuth={onOpenAuth}
      />

      <div className="flex-1 min-w-0">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
