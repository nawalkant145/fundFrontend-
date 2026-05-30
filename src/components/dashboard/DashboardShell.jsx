import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { CURRENT_USER } from "../../constants/mockData";

/**
 * Layout for all post-login pages.
 * mode: 'founder' | 'investor' | 'admin'  (defaults to current user's role)
 */
export default function DashboardShell({ children, title, subtitle, mode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const resolvedMode = mode || CURRENT_USER.role;

  return (
    <div className="min-h-screen bg-dark-navy text-white relative">
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

      <div className="lg:pl-72 relative z-10">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
        />
        <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
