import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { CURRENT_USER } from "../../constants/mockData";

/**
 * Layout wrapper for the immersive shorts feed.
 *
 * Strategy: skip flex-chain height propagation entirely. The body and root
 * already have explicit heights from index.css. We use a single relative
 * parent with absolute children so heights are always concrete.
 */
export default function FeedShell({ children, mode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const resolvedMode = mode || CURRENT_USER.role;

  return (
    <div
      className="overflow-hidden bg-dark-navy text-white relative"
      style={{
        height: "100dvh",
        // Fallback for browsers without dvh
        minHeight: "100vh",
      }}
    >
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary-green/5 rounded-full blur-[180px]" />
      </div>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={resolvedMode}
      />

      {/* Main content area — uses absolute positioning so children always have
          a concrete sizing context */}
      <div className="absolute inset-0 lg:pl-72 z-10 flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* The main slot is a relatively-positioned box that fills the rest.
            Children use the .feed-stage-anchor class to fill it edge-to-edge. */}
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
