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

      {/* Main: On desktop sidebar pushes content right.
          On mobile, feed area stops above the bottom bar so nothing gets
          clipped — the progress bar, text, and actions all stay visible.
          This matches how Instagram Reels actually works: the video area
          ends at the top of the tab bar, it does NOT extend behind it. */}
      <div
        className="absolute inset-0 bottom-14 md:bottom-0 md:left-[72px] z-10 bg-black text-white"
      >
        <main className="relative w-full h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
