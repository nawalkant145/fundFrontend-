import { Link } from "react-router-dom";
import { HiBell } from "react-icons/hi";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import UploadProgressBar from "./UploadProgressBar";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useUploadModal } from "../../context/UploadModalContext";
import UploadPitchModal from "./UploadPitchModal";
import UploadPostModal from "./UploadPostModal";

/**
 * Standard dashboard layout — light premium theme.
 *   - Desktop: Instagram-style collapsed sidebar on the left
 *   - Mobile:  slim top header (logo + notifications) + bottom tab bar
 *
 * Props:
 *   noPad      — full-bleed pages (Messages) skip the centered wrapper
 *   hideMobileHeader — hide the mobile top header (e.g. chat windows)
 */
export default function DashboardShell({
  children,
  title,
  subtitle,
  mode,
  noPad,
  hideMobileHeader,
}) {
  const { user } = useAuth();
  const resolvedMode = mode || user?.role || "founder";
  const unread = useNotifications().unreadCount;
  const { pitchOpen, closePitchModal, postOpen, closePostModal } = useUploadModal();

  return (
    <div
      data-light-app="true"
      className="bg-[#f3f2ef] text-[#0A1F14] h-[100dvh] md:h-auto md:min-h-screen flex flex-col md:block overflow-hidden md:overflow-visible relative"
    >
      {/* Soft brand ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#1B5E3F]/[0.05] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-[#F5B942]/[0.07] rounded-full blur-[180px]" />
      </div>

      <Sidebar mode={resolvedMode} />
      <UploadProgressBar />

      {/* Mobile top header — fixed top flex child (Instagram style) */}
      {!hideMobileHeader && (
        <header className="md:hidden flex-shrink-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#1B5E3F]/8">
          <div className="flex items-center justify-between px-4 h-14">
            <Link to="/app" className="flex items-center">
              <img
                src="/Logobgremove.jpeg"
                alt="EXPGLO FUND"
                className="h-8 w-auto mix-blend-multiply"
              />
            </Link>
            <Link
              to="/app/notifications"
              className="relative p-1 text-[#0F4A2E] flex items-center justify-center"
              aria-label="Notifications"
            >
              <HiBell className="w-6 h-6" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F5B942] text-[#0F4A2E] text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </header>
      )}

      {/* Dedicated scrollable container for feed content */}
      <div className="flex-1 min-h-0 w-full max-w-full overflow-x-hidden overflow-y-auto overscroll-y-contain md:overflow-visible md:h-auto md:pl-[72px] relative z-10">
        {noPad ? (
          <main className="h-full flex flex-col md:h-auto pb-16 md:pb-0">
            {children}
          </main>
        ) : (
          <main className="px-4 sm:px-6 py-5 sm:py-7 max-w-7xl mx-auto pb-20 md:pb-7">
            {(title || subtitle) && (
              <div className="mb-5 md:mb-7">
                {title && (
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0A1F14]">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-[#0A1F14]/60 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </main>
        )}
      </div>

      <BottomBar mode={resolvedMode} />

      <UploadPitchModal open={pitchOpen} onClose={closePitchModal} />
      <UploadPostModal open={postOpen} onClose={closePostModal} />
    </div>
  );
}
