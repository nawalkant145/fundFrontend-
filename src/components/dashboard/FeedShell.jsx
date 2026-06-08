import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { CURRENT_USER } from "../../constants/mockData";

/**
 * Layout for the immersive shorts feed.
 *   - Sidebar + BottomBar are light themed (Sidebar.jsx)
 *   - Feed area itself stays black so vertical videos look premium
 */
export default function FeedShell({ children, mode }) {
  const resolvedMode = mode || CURRENT_USER.role;

  return (
    <div
      className="overflow-hidden bg-white relative"
      style={{ height: "100dvh", minHeight: "100vh" }}
    >
      <Sidebar mode={resolvedMode} />
      <BottomBar mode={resolvedMode} />

      {/* Main: starts at left=72px on desktop (sidebar width), fills to right edge.
          On mobile, leaves 56px at bottom for the tab bar. The feed itself
          paints its own black background — this wrapper just positions it. */}
      <div
        className="absolute inset-0 md:left-[72px] z-10 bg-black text-white"
        style={{
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
