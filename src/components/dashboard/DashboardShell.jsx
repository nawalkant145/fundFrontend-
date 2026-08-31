import { useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import UploadProgressBar from "./UploadProgressBar";
import { useAuth } from "../../context/AuthContext";
import { useUploadModal } from "../../context/UploadModalContext";
import UploadPitchModal from "./UploadPitchModal";
import UploadPostModal from "./UploadPostModal";

/**
 * Standard EXPGLO FUND Dashboard Shell matching Figma specification.
 * - Header: Fixed at top (h-16 / 64px)
 * - Left Sidebar: Stationary (~280px), height calc(100vh - 64px)
 * - Right Sidebar: Stationary (~360-380px), height calc(100vh - 64px)
 * - Main Center: Scrollable container (or overflow-hidden if noScroll is true for Pitch route)
 */
export default function DashboardShell({
  children,
  title,
  subtitle,
  mode,
  noPad,
  noScroll,
  fullWidth,
  rightSidebar,
}) {
  const { user } = useAuth();
  const resolvedMode = mode || user?.role || "founder";
  const { pitchOpen, closePitchModal, postOpen, closePostModal } = useUploadModal();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      data-light-app="true"
      className="bg-[#F8FAFC] text-[#0F172A] h-dvh max-h-dvh w-screen max-w-full overflow-hidden flex flex-col relative antialiased"
    >
      {/* 1. Fixed Header (TopBar ~72px) */}
      <TopBar onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* 2. Main Body Container (Below 72px Header) */}
      <div
        className={`flex-1 min-h-0 h-[calc(100dvh-72px)] w-full flex relative overflow-hidden ${
          fullWidth
            ? "max-w-full p-0 m-0 gap-0"
            : "max-w-[1440px] mx-auto w-full gap-5 xl:gap-6 px-4 sm:px-6"
        }`}
      >
        {/* Desktop Left Sidebar (Constant 280px width) */}
        <div className="hidden md:block w-[280px] min-w-[280px] max-w-[280px] shrink-0 flex-none h-full">
          <Sidebar mode={resolvedMode} />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-[270px] max-w-[80vw] bg-white h-full shadow-2xl z-10 overflow-y-auto">
              <Sidebar mode={resolvedMode} />
            </div>
          </div>
        )}

        {/* Upload progress indicator */}
        <UploadProgressBar />

        {/* Center Main Content Container */}
        <div
          className={`flex-1 min-w-0 h-full ${
            noScroll
              ? "overflow-hidden"
              : "overflow-y-auto sidebar-scroll overscroll-contain"
          }`}
        >
          {noPad ? (
            children
          ) : (
            <main className="w-full pt-4 sm:pt-6 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-6">
              {(title || subtitle) && (
                <div className="mb-5">
                  {title && (
                    <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-medium">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {children}
            </main>
          )}
        </div>

        {/* Desktop Right Sidebar (Stationary, rendered if provided) */}
        {rightSidebar && (
          <div className="hidden lg:block w-[340px] xl:w-[350px] shrink-0 h-full overflow-y-auto sidebar-scroll py-5 space-y-5">
            {rightSidebar}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomBar mode={resolvedMode} />

      {/* Global Modals */}
      <UploadPitchModal open={pitchOpen} onClose={closePitchModal} />
      <UploadPostModal open={postOpen} onClose={closePostModal} />
    </div>
  );
}
