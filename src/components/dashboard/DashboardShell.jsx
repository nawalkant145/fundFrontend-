import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiCurrencyDollar } from "react-icons/hi";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import UploadProgressBar from "./UploadProgressBar";
import FundingImpactCard from "./FundingImpactCard";
import {
  ActiveFundingOpportunitiesCard,
  InvestorActivityCard,
  UpcomingEventsCard,
  TrendingPitchesCard,
  RecommendedStartupsCard,
} from "./RightSidebarCards";
import { useAuth } from "../../context/AuthContext";
import { useUploadModal } from "../../context/UploadModalContext";
import UploadPitchModal from "./UploadPitchModal";
import UploadPostModal from "./UploadPostModal";

                                                                                                                                                                                                                                                                                                                                                                        
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
  const isFounder = resolvedMode === "founder";
  const { pitchOpen, closePitchModal, postOpen, closePostModal } = useUploadModal();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileRightSidebarOpen, setMobileRightSidebarOpen] = useState(false);

  const defaultRightSidebar = (
    <>
      <FundingImpactCard />
      {isFounder ? (
        <>
          <ActiveFundingOpportunitiesCard />
          <InvestorActivityCard />
          <UpcomingEventsCard />
        </>
      ) : (
        <>
          <TrendingPitchesCard />
          <RecommendedStartupsCard />
        </>
      )}
    </>
  );

  const effectiveRightSidebar = rightSidebar || null;

  return (
    <div
      data-light-app="true"
      className="bg-[#F8FAFC] text-[#0F172A] h-dvh max-h-dvh w-screen max-w-full overflow-hidden flex flex-col relative antialiased"
    >
      {                                    }
      <TopBar
        onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onRightSidebarClick={() => setMobileRightSidebarOpen(!mobileRightSidebarOpen)}
      />

      {                                                }
      <div
        className={`flex-1 min-h-0 h-[calc(100dvh-72px)] w-full flex relative overflow-hidden ${
          fullWidth
            ? "max-w-full p-0 m-0 gap-0"
            : "max-w-[1440px] mx-auto w-full gap-5 xl:gap-6 px-4 sm:px-6"
        }`}
      >
        {                                                 }
        <div className="hidden md:block w-[280px] min-w-[280px] max-w-[280px] shrink-0 flex-none h-full">
          <Sidebar mode={resolvedMode} />
        </div>

        {                                        }
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

        {                               }
        <UploadProgressBar />

        {                                   }
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

        {                                                                                      }
        {effectiveRightSidebar && (
          <div className="hidden lg:block w-[340px] xl:w-[350px] shrink-0 h-full overflow-y-auto sidebar-scroll py-5 space-y-5">
            {effectiveRightSidebar}
          </div>
        )}
      </div>

      {                                                                 }
      <AnimatePresence>
        {mobileRightSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
            {              }
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setMobileRightSidebarOpen(false)}
            />

            {                      }
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-[340px] sm:w-[380px] max-w-[90vw] bg-[#F8FAFC] h-full shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0]"
            >
              {                                          }
              <div className="p-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none shrink-0">💰</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A] tracking-tight">
                      Funding Overview
                    </h3>
                    <p className="text-[11px] font-medium text-[#64748B]">
                      Funding, activity & opportunities
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileRightSidebarOpen(false)}
                  className="w-8.5 h-8.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close Right Sidebar"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {                                      }
              <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-5 overscroll-contain">
                {effectiveRightSidebar}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {                                  }
      <BottomBar mode={resolvedMode} />

      {                   }
      <UploadPitchModal open={pitchOpen} onClose={closePitchModal} />
      <UploadPostModal open={postOpen} onClose={closePostModal} />
    </div>
  );
}
