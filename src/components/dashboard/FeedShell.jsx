import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import UploadProgressBar from "./UploadProgressBar";
import { useAuth } from "../../context/AuthContext";

/**
 * Layout for the immersive shorts feed.
 *   - Sidebar + BottomBar are light themed (Sidebar.jsx)
 *   - Feed area itself stays black so vertical videos look premium
 */
export default function FeedShell({ children, mode }) {
  const { user } = useAuth();
  const resolvedMode = mode || user?.role || "founder";

  return (
    <div
      className="overflow-hidden bg-black relative"
      style={{ height: "100dvh" }}
    >
      <Sidebar mode={resolvedMode} />
      <BottomBar mode={resolvedMode} />
      <UploadProgressBar />

      <div className="absolute inset-0 md:left-[72px] z-10 bg-black text-white">
        <main className="relative w-full h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
