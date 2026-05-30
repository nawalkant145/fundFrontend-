import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { CURRENT_USER } from "../../constants/mockData";

/**
 * Like DashboardShell but uses the full vertical space below the topbar.
 * No page title / subtitle / padding — designed for the immersive shorts feed.
 */
export default function FeedShell({ children, mode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const resolvedMode = mode || CURRENT_USER.role;

  return (
    <div className="h-screen overflow-hidden bg-dark-navy text-white relative flex flex-col">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary-green/5 rounded-full blur-[180px]" />
      </div>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={resolvedMode}
      />

      <div className="lg:pl-72 relative z-10 flex flex-col flex-1 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 flex items-center justify-center px-2 sm:px-4 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
