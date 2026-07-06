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
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        onOpenAuth={onOpenAuth}
      />

      <div className="flex-1 min-w-0 h-screen overflow-y-auto app-shell-bg">
        <main>{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
