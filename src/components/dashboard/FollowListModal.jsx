import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdVerified } from "react-icons/md";
import Modal from "../ui/Modal";
import FollowButton from "../monetization/FollowButton";
import { userService } from "../../services/userService";

                                                                                                                                                                                        
export default function FollowListModal({
  open,
  onClose,
  userId,
  mode,
  preloadedFollowers = null,
  preloadedFollowing = null,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId || !mode) return;

                                                         
    setUsers([]);
    setLoading(true);

                                                                 
    const preloaded = mode === "followers" ? preloadedFollowers : preloadedFollowing;
    if (preloaded !== null && Array.isArray(preloaded)) {
                                                                           
      setUsers(preloaded.filter((item) => item && typeof item === "object" && item._id));
      setLoading(false);
      return;
    }

                               
    const fetcher =
      mode === "followers"
        ? userService.getFollowers(userId)
        : userService.getFollowing(userId);
    fetcher
      .then((res) => {
        const data = res?.data?.data || res?.data;
                                                                                    
        const list =
          (mode === "followers"
            ? data?.followers || data?.users || data?.list
            : data?.following || data?.users || data?.list) ||
          (Array.isArray(data) ? data : []);
        const arr = Array.isArray(list) ? list : [];
                                                                                   
        setUsers(arr.filter((item) => item && typeof item === "object" && item._id));
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open, userId, mode, preloadedFollowers, preloadedFollowing]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "followers"
          ? `Followers (${users.length.toLocaleString()})`
          : `Following (${users.length.toLocaleString()})`
      }
      maxWidth="max-w-md"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">
          {mode === "followers"
            ? "No followers yet."
            : "Not following anyone yet."}
        </p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {users.map((u) => {
            const displayName = u.name || u.username || "User";
            return (
              <div key={u._id} className="flex items-center gap-3 py-1">
                <Link
                  to={`/app/u/${u._id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <img
                    src={
                      u.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1B5E3F&color=fff`
                    }
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate flex items-center gap-1">
                      {displayName}
                      {u.isVerified && (
                        <MdVerified className="w-3.5 h-3.5 text-[#F5B942] flex-shrink-0" />
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {u.companyName || (u.username ? `@${u.username}` : u.role || "User")}
                    </p>
                  </div>
                </Link>
                <FollowButton userId={u._id} variant="outline" />
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
