import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { CURRENT_USER } from "../../constants/mockData";

/**
 * Standard dashboard layout — light premium theme.
 *   - Desktop: Instagram-style collapsed sidebar on the left
 *   - Mobile:  bottom tab bar
 *   - No top navbar
 *
 * Props:
 *   noPad — pass true for full-bleed pages (Messages) that need to fill
 *           the full width without the centered max-w-7xl wrapper
 */
export default function DashboardShell({
  children,
  title,
  subtitle,
  mode,
  noPad,
}) {
  const resolvedMode = mode || CURRENT_USER.role;

  return (
    <div
      data-light-app="true"
      className="min-h-screen bg-white text-[#0A1F14] relative"
    >
      {/* Soft brand ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#1B5E3F]/[0.05] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-[#F5B942]/[0.07] rounded-full blur-[180px]" />
      </div>

      <Sidebar mode={resolvedMode} />
      <BottomBar mode={resolvedMode} />

      <div className="md:pl-[72px] relative z-10">
        {noPad ? (
          <main className="pb-14 md:pb-0">{children}</main>
        ) : (
          <main className="px-4 sm:px-6 py-5 sm:py-7 max-w-7xl mx-auto pb-24 md:pb-7">
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
    </div>
  );
}
