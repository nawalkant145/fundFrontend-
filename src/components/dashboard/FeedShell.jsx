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
      className="overflow-hidden bg-black relative"
      style={{ height: "100dvh" }}
    >
      <Sidebar mode={resolvedMode} />
      <BottomBar mode={resolvedMode} />

      {/* Main feed area.
          Desktop: sidebar pushes content right (left-[72px]), full-height
                   centered portrait card.
          Mobile:  fully immersive — the video fills the ENTIRE screen
                   edge-to-edge (inset-0), exactly like Instagram Reels on
                   mobile web. The bottom tab bar floats over the video as a
                   translucent overlay, and the caption + action rail are
                   lifted to clear it. */}
      <div className="absolute inset-0 md:left-[72px] z-10 bg-black text-white">
        <main className="relative w-full h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
