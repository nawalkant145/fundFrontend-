import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { CURRENT_USER } from "../../constants/mockData";

/**
 * Layout for the immersive shorts feed.
 *   - Desktop: collapsed sidebar (icons only, expands on hover)
 *   - Mobile: video fills the screen, bottom tab bar
 *   - No top navbar — Instagram parity
 */
export default function FeedShell({ children, mode }) {
  const resolvedMode = mode || CURRENT_USER.role;

  return (
    <div
      className="overflow-hidden bg-dark-navy text-white relative"
      style={{ height: "100dvh", minHeight: "100vh" }}
    >
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary-green/5 rounded-full blur-[180px]" />
      </div>

      <Sidebar mode={resolvedMode} />
      <BottomBar mode={resolvedMode} />

      {/* Main: starts at left=72px on desktop (sidebar width), fills to right edge.
          On mobile, leaves 56px at bottom for the tab bar. */}
      <div
        className="absolute inset-0 md:left-[72px] z-10"
        style={{
          // Reserve space for mobile bottom bar
          bottom: "var(--bottombar-h, 56px)",
        }}
      >
        <main className="relative w-full h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
