import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { CURRENT_USER } from "../../constants/mockData";

/**
 * Standard dashboard layout for non-feed pages.
 *   - Desktop: Instagram-style collapsed sidebar on the left (icons only,
 *     expands on hover)
 *   - Mobile: bottom tab bar
 *   - No top navbar — like Instagram
 *
 * Props:
 *   noPad   — pass true for full-bleed pages (Messages) that need to fill
 *             the full width without the centered max-w-7xl wrapper
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
    <div className="min-h-screen bg-dark-navy text-white relative">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary-green/5 rounded-full blur-[180px]" />
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
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
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
