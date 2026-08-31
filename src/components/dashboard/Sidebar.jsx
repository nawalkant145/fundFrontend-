import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiUpload,
  HiVideoCamera,
  HiChartBar,
  HiHeart,
  HiChatAlt2,
  HiBell,
  HiCog,
  HiCurrencyDollar,
  HiShieldCheck,
  HiUsers,
  HiClipboardList,
  HiFlag,
  HiLogout,
  HiSearch,
  HiSparkles,
  HiCollection,
  HiPlay,
  HiBookmark,
  HiTrash,
  HiAcademicCap,
  HiTrendingUp,
  HiCalendar,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useUploadModal } from "../../context/UploadModalContext";

const founderNav = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/upload", label: "Upload Pitch", icon: HiUpload },
  { to: "/app/studio", label: "My Studio", icon: HiCollection },
  { to: "/app/analytics", label: "Analytics", icon: HiChartBar },
  { to: "/app/deals", label: "Deals", icon: HiCurrencyDollar },
  { to: "/app/events", label: "Events", icon: HiCalendar },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2 },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Studio Pro", icon: HiSparkles },
];

const investorNav = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/discover", label: "Discover", icon: HiSearch },
  { to: "/app/saved", label: "Saved", icon: HiBookmark },
  { to: "/app/investments", label: "Investments", icon: HiCurrencyDollar },
  { to: "/app/events", label: "Events", icon: HiCalendar },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2 },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Investor Pro", icon: HiSparkles },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: HiHome, end: true },
  { to: "/admin/funding", label: "Funding Impact", icon: HiTrendingUp },
  { to: "/admin/events", label: "Events", icon: HiCalendar },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/pitches", label: "Pitches", icon: HiVideoCamera },
  { to: "/admin/courses", label: "Courses", icon: HiAcademicCap },
  { to: "/admin/kyc", label: "KYC Queue", icon: HiShieldCheck },
  { to: "/admin/moderation", label: "Moderation", icon: HiSparkles },
  { to: "/admin/investments", label: "Investments", icon: HiCurrencyDollar },
  { to: "/admin/reports", label: "Reports", icon: HiFlag },
  { to: "/admin/audit", label: "Audit Log", icon: HiClipboardList },
  { to: "/admin/trash", label: "Trash", icon: HiTrash },
  { to: "/admin/settings", label: "Settings", icon: HiCog },
];

export default function Sidebar({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { openPitchModal } = useUploadModal();
  const role = mode || user?.role || "founder";

  const items =
    role === "investor"
      ? investorNav
      : role === "admin"
        ? adminNav
        : founderNav;

  const isActive = (item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname === item.to ||
        location.pathname.startsWith(item.to + "/");

  return (
    <aside className="w-[280px] min-w-[280px] max-w-[280px] bg-white border-r border-[#E2E8F0] flex flex-col flex-shrink-0 h-full overflow-hidden">
      {/* Top User Profile Card (Compact Figma layout) */}
      <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3 bg-gradient-to-b from-[#F8FAFC] to-white shrink-0">
        <Link to="/app/profile" className="relative flex-shrink-0">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=80`
            }
            alt={user?.name || "User"}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1B5E3F]/20"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to="/app/profile"
            className="font-extrabold text-sm text-[#0F172A] hover:text-[#1B5E3F] transition-colors inline-flex items-center gap-1 truncate max-w-full"
          >
            <span className="truncate">{user?.name || "Nawal Kant"}</span>
            <MdVerified className="w-4 h-4 text-[#10B981] flex-shrink-0" />
          </Link>
          <p className="text-xs text-[#64748B] capitalize font-medium">
            {role === "investor" ? "Investor" : (role || "Founder")}
          </p>
          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold rounded-full border border-[#A5D6A7]">
            ✓ Verified {role === "investor" ? "Investor" : "User"}
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto sidebar-scroll">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            active={isActive(item)}
            role={role}
            badge={item.to.endsWith("/notifications") ? unreadCount : 0}
            onClick={item.to === "/app/upload" ? openPitchModal : undefined}
          />
        ))}

        <div className="pt-2 pb-1">
          <div className="border-t border-[#E2E8F0] my-2" />
        </div>

        {role !== "admin" && (
          <NavLink
            to="/app/settings"
            label="Settings"
            icon={HiCog}
            role={role}
            active={location.pathname === "/app/settings"}
          />
        )}

        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="w-full flex items-center h-10 px-3 rounded-xl text-xs font-bold text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <HiLogout className="w-4.5 h-4.5 mr-3 text-red-500/80 shrink-0" />
          <span className="text-xs">Log out</span>
        </button>
      </nav>

      {/* Bottom Promo Card (Investor Pro for Investor, Studio Pro for Founder) */}
      {role !== "admin" && (
        <div className="p-3 m-3 rounded-2xl shrink-0 shadow-sm transition-all duration-200">
          {role === "investor" ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F4A2E] via-[#1B5E3F] to-[#2D7A4F] text-white shadow-md">
              <div className="flex items-center gap-2 mb-1.5">
                <HiSparkles className="w-4.5 h-4.5 text-[#F5B942] shrink-0" />
                <span className="font-extrabold text-xs tracking-wide">Investor Pro</span>
              </div>
              <p className="text-[11px] text-white/90 leading-relaxed mb-3 font-medium">
                Get advanced insights, early access to deals & exclusive opportunities.
              </p>
              <Link to="/app/subscription">
                <button className="w-full py-2 bg-white hover:bg-slate-50 text-[#0F4A2E] text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer">
                  Upgrade Now
                </button>
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] text-white shadow-md">
              <div className="flex items-center gap-2 mb-1.5">
                <HiSparkles className="w-4 h-4 text-[#F5B942] shrink-0" />
                <span className="font-black text-xs tracking-wide">Studio Pro</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                Unlock advanced analytics, more visibility & boost your pitches.
              </p>
              <Link to="/app/subscription">
                <button className="w-full py-2 bg-white hover:bg-[#FAFAF7] text-[#0F4A2E] text-xs font-extrabold rounded-xl shadow transition-colors cursor-pointer">
                  Upgrade Now
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function NavLink({ to, label, icon: Icon, active, role, badge, onClick }) {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`flex items-center h-10 px-3 rounded-xl transition-all relative ${
        active
          ? "bg-[#1B5E3F]/10 text-[#1B5E3F] font-black"
          : "text-[#475569] font-semibold hover:bg-[#F8FAFC] hover:text-[#0F172A]"
      }`}
    >
      <Icon
        className={`w-4.5 h-4.5 mr-3 shrink-0 ${
          active
            ? "text-[#1B5E3F]"
            : "text-[#64748B]"
        }`}
      />
      <span className="text-xs truncate flex-1">{label}</span>

      {badge > 0 && (
        <span className="min-w-[18px] h-4.5 px-1 bg-[#F59E0B] text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
