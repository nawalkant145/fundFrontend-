import { useNavigate } from "react-router-dom";
import { HiEye, HiX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

                                                                                                                                                         
export default function ImpersonationBanner() {
  const { impersonating, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!impersonating) return null;

  const exit = () => {
    stopImpersonation();
    navigate("/admin/users");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-[#F5B942] text-[#0A1F14] shadow-lg">
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm font-bold">
        <HiEye className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">
          Viewing as{" "}
          <span className="font-black">{impersonating.name || "user"}</span>
        </span>
        <button
          onClick={exit}
          className="ml-2 px-3 py-1 bg-[#0A1F14] text-white rounded-full text-xs font-bold flex items-center gap-1 hover:bg-[#0F4A2E] transition-colors flex-shrink-0"
        >
          <HiX className="w-3.5 h-3.5" /> Exit
        </button>
      </div>
    </div>
  );
}
